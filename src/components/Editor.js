import React, { useEffect, useRef, useState } from "react";
import { EditorState } from "@codemirror/state";
import { basicSetup } from "codemirror";
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { oneDark } from "@codemirror/theme-one-dark";
import { python } from "@codemirror/lang-python";
import { lintGutter, linter } from "@codemirror/lint";
import { pythonLinter } from "../server/fetchLinting";
import styled from "styled-components";

const EditorWrapper = styled.div``;
export default function Editor({ view, parent }) {
  const [code, setCode] = useState("");

  useEffect(() => {
    const onUpdate = EditorView.updateListener.of((v) => {
      setCode(v.state.doc.toString());
    });

    const startState = EditorState.create({
      doc: "",
      extensions: [
        basicSetup,
        keymap.of([defaultKeymap, indentWithTab]),
        // oneDark,
        linter(pythonLinter, { delay: 750 }),
        lintGutter(),
        python(),
        onUpdate,
      ],
    });
    const editorView = new EditorView({
      state: startState,
      parent: parent.current ? parent.current : document.body,
    });

    view.current = editorView;
    return () => {
      editorView.destroy();
    };
  }, [parent, view]);

  return <EditorWrapper ref={view}></EditorWrapper>;
}
