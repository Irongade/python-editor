import { useEffect, useRef, useState, useContext, useCallback } from "react";
import Editor from "../components/Editor";
import { python_code_wrapper, questionData } from "../constants";
import { initializePyodide, runPythonScript } from "../worker/index";
import { logLintAnnotations, logEvent } from "../worker/index";
import { WindowEvent } from "../worker/web.worker";
import { v4 as uuidv4 } from "uuid";
import styled from "styled-components";
import Question from "../components/Question";
import Output from "../components/Output";
import RunButton from "../components/RunButton";
import Resizer from "../components/Resizer";
import Header from "../components/Header";
import Skeleton from "../components/Skeleton";

import { StateContext, INITIAL_STATE } from "../context";

const InterfaceContainer = styled.div`
  height: 100%;
`;

const AppContainer = styled.div`
  width: 100%;
  height: 90%;
  display: flex;
  flex-direction: row;

  justify-content: center;
  align-items: center;
`;

const QuestionContainer = styled.div`
  // width: 50%;
  height: 95%;
  display: flex;
  flex-direction: column;
  background-color: white;
  padding: 1.25rem 1rem;
  border-radius: 8px;
  margin-left: 1rem;
`;

const BodyContainer = styled.div`
  flex: 1 1 0%;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-right: 1rem;

  justify-content: center;
  align-items: center;
`;

const EditorContainer = styled.div`
  width: 100%;
  height: 65%;
  display: flex;
  flex-direction: column;

  background-color: white;
  border-radius: 8px;
  padding-bottom: 8px;

  &&& .cm-editor {
    height: 100%;
  }
`;

const OutputContainer = styled.div`
  width: 100%;
  height: 35%;
  background-color: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
`;

const EditorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding: 1rem;
`;

const EditorHeaderText = styled.h4`
  font-size: 1rem;
  color: #132b3e;
  margin: 0;
`;

function Interface() {
  const [appInfo, setAppInfo] = useState({
    currentUser: "",
    currentQuestion: "",
  });

  const pyodide = useRef(null);
  const view = useRef(null);
  const parentRef = useRef(null);
  const [isPyodideReady, setIsPyodideReady] = useState(false);
  const [isCodeRunning, setIsCodeRunning] = useState(false);
  const { userId, skillLevel } = useContext(StateContext);

  // question
  const [currentQuestion, setCurrentQuestion] = useState(questionData[0]);
  const [answers, setAnswers] = useState({});

  const [output, setOutput] = useState("");
  const [consoleOutput, setConsoleOutput] = useState([]);

  // useEffect(() => {
  //   const loadPyodide = async () => {
  //     if (!window.isPyodideLoading) {
  //       pyodide.current = window.pyodide;
  //     }
  //   };

  //   loadPyodide();

  //   console.log(pyodide);
  // }, [window.isPyodideLoading]);

  const runCode = async () => {
    const code = view.current.state.doc.toString();

    await loadImportedPackagesFromCode(code);

    console.log("packages", pyodide.current.loadedPackages);

    const result = await pyodide.current.runPython(`run_code("${code}")`);

    // const result = await pyodide.current.runPython(code);

    console.log("here", result);

    setOutput(result);
  };

  const loadImportedPackagesFromCode = async (code) => {
    await pyodide.current.loadPackagesFromImports(code);
  };

  const setupPyodide = async () => {
    try {
      // await loadImportedPackagesFromCode(python_code_wrapper);
      await pyodide.current.runPython(python_code_wrapper);
      console.log(pyodide.current.globals.get("run_code"));
    } catch (e) {
      console.log(e);
    }

    return;
  };

  const runTest = async () => {
    console.log("heree");
    pyodide.current.globals.set("code_to_run", "1 + 2");
    await pyodide.current.runPython(`
    from io import StringIO
    import sys
    import traceback
    namespace = {}  # use separate namespace to hide run_code, modules, etc.
    def run_code(code):
      """run specified code and return stdout and stderr"""
      out = StringIO()
      oldout = sys.stdout
      olderr = sys.stderr
      sys.stdout = sys.stderr = out
      try:
          # change next line to exec(code, {}) if you want to clear vars each time
          exec(code, namespace)
      except:
          traceback.print_exc()
    
      sys.stdout = oldout
      sys.stderr = olderr
      return out.getvalue()
    `);

    const result = await pyodide.current.runPython("run_code('1 + 2')");

    console.log(result);
  };

  const runAsync = async () => {
    setIsCodeRunning(true);
    const code = view.current.state.doc.toString();

    const result = await runPythonScript(code);

    console.log("async run", result);

    if ("result" in result) {
      setOutput(result.result);
    } else if ("error" in result) {
      setOutput(result.error);
    } else {
      setOutput("Something went wrong");
    }

    setConsoleOutput(result.console);

    setIsCodeRunning(false);
  };

  const onFocus = () => {
    // console.log("Tab is in focus");
    logEvent(WindowEvent.FOCUS);
  };

  // User has switched away from the tab (AKA tab is hidden)
  const onBlur = () => {
    // console.log("Tab is blurred");
    logEvent(WindowEvent.BLUR);
  };

  useEffect(() => {
    const onBeforeUnload = (event) => {
      event.preventDefault();
      // console.log("Tab is unloaded");
      logEvent(WindowEvent.CLOSE);
      event.returnValue = `Are you sure you want to leave?`;
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    window.addEventListener("beforeunload", onBeforeUnload);

    window["logLintAnnotations"] = logLintAnnotations;
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, []);

  useEffect(() => {
    (async function () {
      const userId = uuidv4();
      const result = await initializePyodide({
        userId,
        packages: [],
      });

      if (result.result === "success") {
        setIsPyodideReady(true);
      }

      console.log("main", result);
    })();
  }, []);

  const changeQuestion = useCallback(
    (increment) => {
      const numOfQuestions = questionData.length;
      const currentQuestionId = currentQuestion.id;
      let nextQuestionId = 0;

      if (increment) {
        nextQuestionId = currentQuestionId + 1;
      } else {
        nextQuestionId = currentQuestionId - 1;
      }

      if (nextQuestionId < 1 || nextQuestionId > numOfQuestions) {
        return;
      }

      const currentAnswer = view.current.state.doc.toString() || "";

      // save answer
      setAnswers({ ...answers, [currentQuestionId]: currentAnswer });

      // switch question
      setCurrentQuestion(
        questionData.find((question) => question.id === nextQuestionId)
      );

      // update the value in the codemirror input to the next question's answer if it exists.
      view.current.dispatch({
        changes: {
          from: 0,
          to: view.current.state.doc.length,
          insert: answers[nextQuestionId] || "",
        },
      });
    },
    [answers, currentQuestion]
  );

  console.log("context", userId, skillLevel);

  return (
    <InterfaceContainer>
      <Header questionNo={currentQuestion.id} onClickFn={changeQuestion} />
      <AppContainer>
        <QuestionContainer>
          <Question question={currentQuestion} />
        </QuestionContainer>
        <Resizer />
        <BodyContainer>
          <EditorContainer ref={parentRef}>
            {isPyodideReady && (
              <>
                <EditorHeader>
                  <EditorHeaderText>Code</EditorHeaderText>
                  <RunButton isLoading={isCodeRunning} onClickFn={runAsync} />
                </EditorHeader>
                <Editor view={view} parent={parentRef} />
              </>
            )}
            {!isPyodideReady && <Skeleton />}
          </EditorContainer>
          <OutputContainer>
            <Output output={output} consoleOutput={consoleOutput} />
          </OutputContainer>
        </BodyContainer>
      </AppContainer>
    </InterfaceContainer>
  );
}

// [06/06 15:06] Nick Dalton

// When did the user open page

// [06/06 15:06] Nick Dalton

// 2. When did the user press run

// [06/06 15:07] Nick Dalton

// 3.What was the result of presssing run ? ( syntax error OR OK )

// [06/06 15:08] Nick Dalton

// 4. [ option ] did it pass the unit test ?

// [06/06 15:09] Nick Dalton

// 5. When the page is closed or looses focus.

// [06/06 15:09] Nick Dalton

// 3.1 what was the syntax error

// [06/06 15:11] Nick Dalton

// 2.1 When press run what was size/hashcode of code.

// Window: user_id	open_page_time	close_page_time	page_focus_times	no_of_time_focus_lost date
// user_id, window_event_type, time, date
// Execution: user_id	run_hash	run_output	did_test_pass	is_execution_success time
// Linting: user_id	lint_classification	lint_message	lint_severity	time	date

export default Interface;
