/* eslint-disable no-restricted-globals */
import { sha256 } from "ohash";
// import { find_imports_wrapper, py_error_reformater } from "../constants";
import date from "date-and-time";
import doc from "../server/connectGsheets";

export const Events = {
  initialize: "initialize",
  executeScript: "executeScript",
  logEvent: "logEvent",
  logLintMetrics: "logLintMetrics",
  updateQuestion: "updateQuestion",
  closeEvent: "closeEvent",
};

export const WindowEvent = {
  BLUR: "BLUR",
  FOCUS: "FOCUS",
  INIT: "INIT",
  CLOSE: "CLOSE",
};

const CONSOLE_KEY = "consoleOutput";

if ("function" === typeof importScripts) {
  // eslint-disable-next-line no-undef
  importScripts("https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js");

  console.log("worker self", self);
  self[CONSOLE_KEY] = [];

  let isPyodideInitialized = false;
  let pyodidePackages = [];
  let currentRunCodeHash = "";
  let userId = "";
  let lintErrors = new Set();
  let currentQuestion = {};

  async function loadPyodideAndPackages(packages) {
    self.pyodide = await self.loadPyodide();
    if (packages && packages.length > 0) {
      await self.pyodide.loadPackage(packages);
    }

    self.pyodide.setStdout({
      batched: (msg) => {
        self[CONSOLE_KEY] = [...self[CONSOLE_KEY], msg];
      },
    });
  }

  // async function extractImportedPackages(code) {
  //   const script = find_imports_wrapper(JSON.stringify(code));

  //   let result = await self.pyodide.runPythonAsync(script);

  //   return result.toJs();
  // }

  async function executeScript(python) {
    let output = {};

    let consoleOutput = [];
    self[CONSOLE_KEY] = [];

    try {
      let res = await self.pyodide.runPythonAsync(python);

      consoleOutput = self[CONSOLE_KEY];

      if (self.pyodide.isPyProxy(res)) {
        res = res.toJs();
      }

      // console.log("execute script", res);
      output = {
        result: res,
        isError: false,
        consoleOutput,
      };
    } catch (error) {
      // console.log("execute script error", error.message);
      consoleOutput = self[CONSOLE_KEY];

      output = {
        result: error.message,
        isError: true,
        consoleOutput,
      };
    }

    return output;
  }

  const initialize = async (event) => {
    const { id, packages, userIdentifier, question, userDetails } = event.data;

    userId = userIdentifier;
    currentQuestion = question;
    // console.log("init params", id, packages, userIdentifier, userId);

    let response = {};
    try {
      // make sure loading is done

      const initPyodideLoadStart = performance.now();
      await loadPyodideAndPackages(packages);
      const initPyodideLoadEnd = performance.now();

      console.log(
        "Total pyodide init time taken: ",
        (initPyodideLoadEnd - initPyodideLoadStart) / 1000
      );

      const initDocLoadStart = performance.now();
      await doc.loadInfo();
      const initDocLoadEnd = performance.now();

      console.log(
        "Total google doc init time taken: ",
        (initDocLoadEnd - initDocLoadStart) / 1000
      );

      const now = new Date();

      const initaliedPayload = {
        user_id: userId,
        current_question_id: question.id,
        window_event_type: WindowEvent.INIT,
        time: date.format(now, "HH:mm:ss"),
        date: date.format(now, "YYYY/MM/DD"),
      };
      const windowSheet = doc.sheetsByTitle["Window"];
      await windowSheet.addRow(initaliedPayload);

      const userSheet = doc.sheetsByTitle["Users"];
      await userSheet.addRow({
        ...userDetails,
        time: date.format(now, "HH:mm:ss"),
        date: date.format(now, "YYYY/MM/DD"),
      });

      response = { id: id, result: "success" };
      isPyodideInitialized = true;

      console.log("INITIALIZATION COMPLETE");
    } catch (err) {
      response = { id: id, result: "failed" };

      isPyodideInitialized = false;
      console.log("NOT INITIALIZED");
    }

    self.postMessage(response);
  };

  const runPythonScript = async (event) => {
    const { id, python, question, ...context } = event.data;
    // The worker copies the context in its own "memory" (an object mapping name to values)
    for (const key of Object.keys(context)) {
      self[key] = context[key];
    }

    const previousRunCodeHash = currentRunCodeHash;

    currentRunCodeHash = sha256(python);

    console.log("compare hash", currentRunCodeHash, previousRunCodeHash);
    let payload = {};

    await self.pyodide.loadPackagesFromImports(python);

    let didAllTestsPass = true;
    let isExecutionSuccessful = true;
    let output = {};
    let failingTests = [];

    // execute for output
    const result = await executeScript(python);

    if (result.isError) {
      isExecutionSuccessful = false;
    }

    output = {
      result: result,
    };

    // execute for tests
    for (let i = 0; i < question.tests.length; i++) {
      const currentTest = question.tests[i];

      const assertTestScript = python + currentTest.test;
      const testCase = python + currentTest.case;

      const assertTestResult = await executeScript(assertTestScript);

      const testCaseResult = await executeScript(testCase);

      console.log("test case - ", assertTestResult, testCaseResult);

      // if we expect output of current test to be true and we get an error
      // then a test has failed.
      if (currentTest.result && assertTestResult.isError) {
        didAllTestsPass = false;

        failingTests.push(currentTest);
      }

      output = {
        ...output,
        [`case${i + 1}`]: {
          ...assertTestResult,
          result: testCaseResult.result,
        },
      };
    }

    payload = {
      result: output,
      id,
      isSuccess: isExecutionSuccessful,
      didAllTestsPass,
      question_id: question.id,
      failingTests,
    };

    if (currentRunCodeHash !== previousRunCodeHash) {
      const sheet = doc.sheetsByTitle["Execution"];

      const now = new Date();

      const rowData = {
        user_id: userId,
        run_hash: currentRunCodeHash,
        code: python,
        did_tests_pass: didAllTestsPass,
        is_execution_success: isExecutionSuccessful,
        question_id: question.id,
        question_test_output: JSON.stringify(payload.result),
        time: date.format(now, "HH:mm:ss"),
        date: date.format(now, "YYYY/MM/DD"),
      };

      console.log("run payload for gsheets", rowData, payload);

      await sheet.addRow(rowData);
      // user_id	run_hash	run_output	did_test_pass	is_execution_success time
    }

    console.log("final run output", payload);

    self.postMessage(payload);
  };

  const lintCode = async (event) => {
    const { annotations } = event.data;

    const errors = [];

    annotations.forEach((annotation) => {
      const uniqueIdentifier =
        annotation.from +
        annotation.to +
        annotation.severity +
        annotation.message;

      if (lintErrors.has(uniqueIdentifier)) {
        return;
      }

      lintErrors.add(uniqueIdentifier);

      const now = new Date();

      errors.push({
        user_id: userId,
        current_question_id: currentQuestion.id,
        lint_classification: annotation.symbol, // work on error classification
        lint_message: annotation.message,
        lint_severity: annotation.severity,
        lint_type: annotation.type,
        lint_code: annotation.code,
        lint_code_line: annotation.line_text,
        time: date.format(now, "HH:mm:ss"),
        date: date.format(now, "YYYY/MM/DD"),
      });
    });

    console.log("lint errors", errors, annotations, lintErrors);

    if (errors.length > 0) {
      const sheet = doc.sheetsByTitle["Linting"];
      await sheet.addRows(errors);
    }

    // Linting: user_id current_question_id	lint_classification	lint_message	lint_severity	time	date
  };

  const logEvent = async (event) => {
    const { id, eventType } = event.data;

    const now = new Date();

    const payload = {
      user_id: userId,
      current_question_id: currentQuestion.id,
      window_event_type: eventType,
      time: date.format(now, "HH:mm:ss"),
      date: date.format(now, "YYYY/MM/DD"),
    };

    console.log("event", payload);

    const sheet = doc.sheetsByTitle["Window"];
    await sheet.addRow(payload);
  };

  const updateQuestion = (event) => {
    const { question } = event.data;

    currentQuestion = question;
  };

  self.onmessage = async (event) => {
    if (event.data.type === Events.initialize) {
      const initStart = performance.now();
      await initialize(event);
      const initEnd = performance.now();

      console.log("Total init time taken: ", (initEnd - initStart) / 1000);
    }

    if (!isPyodideInitialized) {
      return self.postMessage({ error: "Pyodide initialization failed" });
    }

    if (!userId) {
      return self.postMessage({ error: "" });
    }

    if (event.data.type === Events.updateQuestion) {
      updateQuestion(event);
    }

    if (event.data.type === Events.closeEvent) {
      lintErrors = new Set();
      currentQuestion = {};
      currentRunCodeHash = "";
      userId = "";
      self[CONSOLE_KEY] = [];
    }

    if (event.data.type === Events.executeScript) {
      const runStart = performance.now();

      await runPythonScript(event);

      const runEnd = performance.now();

      console.log("Total run time taken: ", (runEnd - runStart) / 1000);
    }

    if (event.data.type === Events.logLintMetrics) {
      const lintStart = performance.now();

      await lintCode(event);

      const lintEnd = performance.now();
      console.log("Total lint time taken: ", (lintEnd - lintStart) / 1000);
    }

    if (event.data.type === Events.logEvent) {
      const logStart = performance.now();

      await logEvent(event);

      const logEnd = performance.now();
      console.log("Total log event time taken: ", (logEnd - logStart) / 1000);
    }

    // user_id, window_event_type, time, date
  };
}
