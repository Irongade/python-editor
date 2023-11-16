import Worker from "web-worker";
import { v4 as uuidv4 } from "uuid";
import { Events } from "./web.worker";

const pyodideWorker = new Worker(new URL("./web.worker.js", import.meta.url));

const callbacks = {};

pyodideWorker.onmessage = (event) => {
  const { id, ...data } = event.data;

  console.log("heree", id, data);

  const onSuccess = callbacks[id];
  if (!!onSuccess) {
    delete callbacks[id];
    onSuccess(data);
  }
};

const runPythonScript = (() => {
  return (script, question, context) => {
    const id = uuidv4();
    return new Promise((onSuccess) => {
      callbacks[id] = onSuccess;
      pyodideWorker.postMessage({
        ...context,
        type: Events.executeScript,
        python: script,
        question,
        id,
      });
    });
  };
})();

const initializePyodide = (() => {
  return (data) => {
    const id = uuidv4();
    return new Promise((onSuccess) => {
      callbacks[id] = onSuccess;
      pyodideWorker.postMessage({
        type: Events.initialize,
        packages: data.packages || [],
        userIdentifier: data.userId,
        question: data.question,
        userDetails: data.userDetails,
        id,
      });
    });
  };
})();

const logLintAnnotations = (annotations = []) => {
  const id = uuidv4();
  pyodideWorker.postMessage({
    type: Events.logLintMetrics,
    annotations: annotations,
    id,
  });
};

const updateCurrentQuestion = (question = {}) => {
  const id = uuidv4();
  pyodideWorker.postMessage({
    type: Events.updateQuestion,
    question: question,
    id,
  });
};

const logEvent = (eventType) => {
  const id = uuidv4();
  pyodideWorker.postMessage({
    type: Events.logEvent,
    eventType: eventType,
    id,
  });
};

export {
  runPythonScript,
  initializePyodide,
  logLintAnnotations,
  logEvent,
  updateCurrentQuestion,
};
