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
  return (script, context) => {
    const id = uuidv4();
    return new Promise((onSuccess) => {
      callbacks[id] = onSuccess;
      pyodideWorker.postMessage({
        ...context,
        type: Events.executeScript,
        python: script,
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
        id,
      });
    });
  };
})();

// const logLintAnnotations = (() => {
//   return (annotations = []) => {
//     const id = uuidv4();
//     return new Promise((onSuccess) => {
//       callbacks[id] = onSuccess;
//       pyodideWorker.postMessage({
//         type: Events.logLintMetrics,
//         annotations: annotations,
//         id,
//       });
//     });
//   };
// })();

const logLintAnnotations = (annotations = []) => {
  const id = uuidv4();
  pyodideWorker.postMessage({
    type: Events.logLintMetrics,
    annotations: annotations,
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

console.log("log", logLintAnnotations);

export { runPythonScript, initializePyodide, logLintAnnotations, logEvent };
