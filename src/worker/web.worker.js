/* eslint-disable no-restricted-globals */
import { sha256 } from "ohash";
import axios from "axios";
import { find_imports_wrapper, py_error_reformater } from "../constants";
import date from "date-and-time";
import doc from "../server/connectGsheets";

export const Events = {
  initialize: "initialize",
  executeScript: "executeScript",
  logEvent: "logEvent",
  logLintMetrics: "logLintMetrics",
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

  console.log(self);
  self[CONSOLE_KEY] = [];

  let isPyodideInitialized = false;
  let pyodidePackages = [];
  let currentRunCodeHash = "";
  let userId = "";
  let lintErrors = new Set();

  async function loadPyodideAndPackages(packages) {
    self.pyodide = await self.loadPyodide();
    if (packages && packages.length > 0) {
      await self.pyodide.loadPackage(packages);
    }

    self.pyodide.setStdout({
      batched: (msg) => {
        console.log(msg);
        self[CONSOLE_KEY] = [...self[CONSOLE_KEY], msg];
      },
    });
  }

  async function extractImportedPackages(code) {
    const script = find_imports_wrapper(JSON.stringify(code));

    let result = await self.pyodide.runPythonAsync(script);

    return result.toJs();
  }

  const initialize = async (event) => {
    const { id, packages, userIdentifier } = event.data;

    userId = userIdentifier;
    console.log("init", id, packages, userIdentifier, userId);

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

      // console.log("resp", doc, doc.title, await doc.sheetsById[0].getRows());

      const now = new Date();

      const initaliedPayload = {
        user_id: userId,
        window_event_type: WindowEvent.INIT,
        time: date.format(now, "HH:mm:ss"),
        date: date.format(now, "YYYY/MM/DD"),
      };
      const sheet = doc.sheetsByTitle["Window"];
      // await sheet.addRow(initaliedPayload);

      response = { id: id, result: "success" };
      isPyodideInitialized = true;

      console.log("INITIALIZED", sheet);
    } catch (err) {
      console.log("err", err);
      response = { id: id, result: "failed" };

      isPyodideInitialized = false;
      console.log("NOT INITIALIZED");
    }

    self.postMessage(response);
  };

  const runPythonScript = async (event) => {
    const { id, python, ...context } = event.data;
    // The worker copies the context in its own "memory" (an object mapping name to values)
    for (const key of Object.keys(context)) {
      self[key] = context[key];
    }

    //  we clear any previous console output.
    self[CONSOLE_KEY] = [];

    // console.log("hereee", self.pyodide.loadedPackages, ps);
    //       self.pyodide.runPython(`
    // import sys
    // def reformat_exception():
    //     from traceback import format_exception
    //     # Format a modified exception here
    //     # this just prints it normally but you could for instance filter some frames
    //     return "".join(
    //         format_exception(sys.last_type, sys.last_value, sys.last_traceback)
    //     )
    // `);
    //       let reformat_exception = self.pyodide.globals.get("reformat_exception");

    //       console.log(reformat_exception, "inside");

    console.log("run resp", doc, doc.title);

    const previousRunCodeHash = currentRunCodeHash;

    currentRunCodeHash = sha256(python);

    console.log("heree", currentRunCodeHash, previousRunCodeHash);
    let payload = {};

    // Now is the easy part, the one that is similar to working in the main thread:
    try {
      // const packagesToImport = await extractImportedPackages(python);

      // if (packagesToImport.length !== pyodidePackages.length) {
      //   console.log(
      //     "hereee",
      //     self.pyodide.loadedPackages,
      //     packagesToImport,
      //     pyodidePackages
      //   );
      //   pyodidePackages = packagesToImport;
      // }

      await self.pyodide.loadPackagesFromImports(python);
      let result = await self.pyodide.runPythonAsync(python);

      const consoleOuputs = self[CONSOLE_KEY];

      payload = { result, id, console: consoleOuputs, isSuccess: true };
    } catch (error) {
      // error.message = reformat_exception();

      // console.log(error.message, reformat_exception());

      const consoleOuputs = self[CONSOLE_KEY];

      payload = {
        error: error.message,
        id,
        console: consoleOuputs,
        isSuccess: false,
      };
    }

    if (currentRunCodeHash !== previousRunCodeHash) {
      const sheet = doc.sheetsByTitle["Execution"];

      const now = new Date();

      const rowData = {
        user_id: userId,
        run_hash: currentRunCodeHash,
        code: python,
        run_output: payload.isSuccess ? payload.result : payload.error,
        is_execution_success: payload.isSuccess,
        time: date.format(now, "HH:mm:ss"),
        date: date.format(now, "YYYY/MM/DD"),
      };

      console.log("run output", rowData);

      // figure out did_test_pass flag

      // await sheet.addRow(rowData);
      // user_id	run_hash	run_output	did_test_pass	is_execution_success time
    }

    self.postMessage(payload);
  };

  const lintCode = async (event) => {
    const { id, annotations } = event.data;

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
        classification: annotation.symbol, // work on error classification
        lint_message: annotation.message,
        lint_severity: annotation.severity,
        lint_type: annotation.type,
        lint_code: annotation.code,
        time: date.format(now, "HH:mm:ss"),
        date: date.format(now, "YYYY/MM/DD"),
      });
    });

    console.log("lint", errors, annotations, lintErrors);

    if (errors.length > 0) {
      const sheet = doc.sheetsByTitle["Linting"];
      await sheet.addRows(errors);
    }

    // Linting: user_id	lint_classification	lint_message	lint_severity	time	date
  };

  const logEvent = async (event) => {
    const { id, eventType } = event.data;

    const now = new Date();

    const payload = {
      user_id: userId,
      window_event_type: eventType,
      time: date.format(now, "HH:mm:ss"),
      date: date.format(now, "YYYY/MM/DD"),
    };

    console.log("event", payload);

    const sheet = doc.sheetsByTitle["Window"];
    // await sheet.addRow(payload);
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
