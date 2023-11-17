import { useEffect, useRef, useState, useContext, useCallback } from "react";
import Editor from "../components/Editor";
import { questionData } from "../constants";
import {
  initializePyodide,
  runPythonScript,
  updateCurrentQuestion,
} from "../worker/index";
import { logLintAnnotations, logEvent } from "../worker/index";
import { WindowEvent } from "../worker/web.worker";
import styled from "styled-components";
import Question from "../components/Question";
import Output from "../components/Output";
import Button from "../components/Button";
import Resizer from "../components/Resizer";
import Header from "../components/Header";
import Skeleton from "../components/Skeleton";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import { useNavigate } from "react-router-dom";

import { StateContext } from "../context";

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
  overflow-y: scroll;
`;

const BodyContainer = styled.div`
  flex: 1 1 0%;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  margin-right: 1rem;

  justify-content: center;
  align-items: center;
`;

const EditorContainer = styled.div`
  width: 100%;
  height: 50%;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;

  background-color: white;
  border-radius: 8px;
  padding-bottom: 8px;

  &&& .cm-editor {
    height: 100%;
  }
`;

const OutputContainer = styled.div`
  width: 100%;
  flex: 1 1 0%;
  overflow: scroll;

  // height: 40%;
  background-color: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
`;

const EditorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 0.5rem;
  padding: 1rem;
  padding-bottom: 0px;
`;

const EditorHeaderText = styled.h4`
  font-size: 1rem;
  color: #132b3e;
  margin: 0;
`;

function Interface() {
  const view = useRef(null);
  const parentRef = useRef(null);
  const [isPyodideReady, setIsPyodideReady] = useState(false);
  const [isCodeRunning, setIsCodeRunning] = useState(false);
  const { userId, skillLevel } = useContext(StateContext);
  const navigate = useNavigate();

  // question
  const [currentQuestion, setCurrentQuestion] = useState(questionData[0]);
  const [answers, setAnswers] = useState({});
  const [questionTestStatus, setQuestionTestStatus] = useState({});

  const [output, setOutput] = useState("");

  const [openModal, setOpenModal] = useState(false);

  const runAsync = async () => {
    setIsCodeRunning(true);
    const code = view.current.state.doc.toString();

    const result = await runPythonScript(code, currentQuestion);

    if ("result" in result) {
      setOutput(result.result);
    }

    setQuestionTestStatus({ [currentQuestion.id]: result.didAllTestsPass });

    setIsCodeRunning(false);
  };

  const onFocus = () => {
    logEvent(WindowEvent.FOCUS);
  };

  // User has switched away from the tab (AKA tab is hidden)
  const onBlur = () => {
    logEvent(WindowEvent.BLUR);
  };

  useEffect(() => {
    const onBeforeUnload = (event) => {
      event.preventDefault();
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
      // const userId = uuidv4();
      const result = await initializePyodide({
        userId,
        question: questionData[0],
        userDetails: {
          user_id: userId,
          skill_level: skillLevel,
        },
        packages: [],
      });

      if (result.result === "success") {
        setIsPyodideReady(true);
      }
    })();
  }, [skillLevel, userId]);

  useEffect(() => {
    if (
      isPyodideReady &&
      view &&
      view.current &&
      currentQuestion &&
      !answers[currentQuestion.id]
    ) {
      view.current.dispatch({
        changes: {
          from: 0,
          to: view.current.state.doc.length,
          insert: currentQuestion.initText || "",
        },
      });
    }
  }, [answers, currentQuestion, isPyodideReady]);

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

      // update current question in worker
      updateCurrentQuestion(
        questionData.find((question) => question.id === nextQuestionId)
      );

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

  const endSession = () => {
    logEvent(WindowEvent.CLOSE);

    navigate("/end");
  };

  console.log("app context", userId, skillLevel);
  console.log("run output", output);

  return (
    <InterfaceContainer>
      <Header
        questionNo={currentQuestion.id}
        onClickFn={changeQuestion}
        openModalFn={() => setOpenModal(true)}
        questionTestStatus={questionTestStatus}
      />
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
                  <EditorHeaderText></EditorHeaderText>
                  <Button
                    text={"Run"}
                    isLoading={isCodeRunning}
                    onClickFn={runAsync}
                  />
                </EditorHeader>
                <Editor
                  view={view}
                  parent={parentRef}
                  initValue={currentQuestion.initText}
                />
              </>
            )}
            {!isPyodideReady && <Skeleton />}
          </EditorContainer>
          <Resizer direction="vertical" />
          <OutputContainer>
            <Output output={output} currentQuestion={currentQuestion} />
          </OutputContainer>
        </BodyContainer>
      </AppContainer>

      <Modal open={openModal} onClose={() => setOpenModal(false)} center>
        <h2 style={{ marginBottom: "1rem" }}>End Session</h2>

        <p style={{ marginBottom: "1rem" }}>
          Are you sure you want to end the current session? This action is not
          reversible.
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ display: "flex", gap: "1rem" }}>
            <Button onClickFn={endSession} type={"danger"} text={"Confirm"} />
            <Button onClickFn={() => setOpenModal(false)} text={"Go back"} />
          </div>
        </div>
      </Modal>
    </InterfaceContainer>
  );
}

// 2.1 When press run what was size/hashcode of code.

// Window: user_id	open_page_time	close_page_time	page_focus_times	no_of_time_focus_lost date
// user_id, window_event_type, time, date
// Execution: user_id	run_hash	run_output	did_test_pass	is_execution_success time
// Linting: user_id	lint_classification	lint_message	lint_severity	time	date

export default Interface;
