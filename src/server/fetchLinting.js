import axios from "axios";
const { logLintAnnotations, pyodideWorker } = await import("../worker");

console.log("toplevel", logLintAnnotations, pyodideWorker);

// line: number, col: number, doc: Text, offset: {line, col, pos}
function mapPos(line, col, doc, offset) {
  let lineNumber = line;
  let colNumber = col;

  if (offset.line) {
    lineNumber = lineNumber + offset.line;
  }

  if (colNumber !== 0) {
    if (line === 1) {
      colNumber = colNumber + (offset.col || 0) - 1;
    } else {
      colNumber = colNumber - 1;
    }
  }

  return doc.line(lineNumber).from + colNumber;
}

export const pythonLinter = async (view) => {
  let annotations = [];
  // console.log(view.state.doc.toString());

  const payload = "code=" + encodeURIComponent(view.state.doc.toString());

  const response = await axios.post(
    "https://api.pythoneditor.xyz/api/lint",
    payload,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  // console.log(
  //   response,
  //   view,
  //   view.state.doc,
  //   view.state.doc.line(1),
  //   view.state.doc.line(1).from + 0
  // );

  console.log("lint", response, response.data, typeof response.data);

  if (response.status === 200) {
    annotations = response.data.map((lint) => {
      let severity = "warning";

      if (lint.type === "convention" || lint.type === "refactor") {
        severity = "info";
      }

      if (lint.type === "error" || lint.type === "fatal") {
        severity = "error";
      }

      const start = mapPos(lint.line, lint.column, view.state.doc, {});
      const end =
        lint.endLine !== null && lint.endColumn !== 1
          ? mapPos(lint.endLine, lint.endColumn, view.state.doc, {})
          : start;

      const currentLine = view.state.doc.lineAt(start);

      const currentLineText = view.state.sliceDoc(
        currentLine.from,
        currentLine.to
      );

      // console.log("Observeeee", currentLineText);

      return {
        message: lint.message,
        severity: severity,
        from: start,
        to: end,
        type: lint.type,
        code: lint["message-id"],
        symbol: lint.symbol,
        line_text: currentLineText,
      };
    });
  }

  // console.log(annotations, window.logLintAnnotations, pyodideWorker);

  !!window.logLintAnnotations && window.logLintAnnotations(annotations);

  return annotations;
};
