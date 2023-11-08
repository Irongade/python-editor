import React, { useState } from "react";
import styled from "styled-components";

const OutputContainer = styled.div`
  width: 100%;
  display: flex;
  height: auto;
  flex-direction: column;
  height: 100%;
  padding-bottom: 1rem;
`;

const ResultsWrapper = styled.div`
  display: flex;
  padding: 1rem;
  height: 100%;
`;

const ResultsContainer = styled.div`
  width: 100%;
  display: flex;
  height: 86.3px;
  flex-direction: column;
  overflow-y: scroll;
  box-sizing: border-box;

  font-family: Menlo, sans-serif;
  padding-bottom: 10px;
  padding-top: 10px;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  background-color: #edf2f7;
  border-color: #0000;
  border-width: 1px;
  border-radius: 0.5rem;
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  height: 10%;
  box-sizing: border-box;
  padding-left: 1rem;
  padding-top: 1rem;
`;

const HeaderText = styled.h4`
  font-size: 1rem;
  color: #132b3e;
  margin: 0;
`;

const Output = ({ output, consoleOutput = [] }) => {
  const [state, setState] = useState("Results");

  return (
    <OutputContainer>
      <Header>
        <HeaderText>{state}</HeaderText>
      </Header>
      <ResultsWrapper>
        {state === "Results" && <ResultsContainer>{output}</ResultsContainer>}
      </ResultsWrapper>

      <Header>
        <HeaderText>{"Console"}</HeaderText>
      </Header>
      <ResultsWrapper>
        <ResultsContainer>
          {consoleOutput.map((c) => (
            <p>{c}</p>
          ))}
        </ResultsContainer>
      </ResultsWrapper>
    </OutputContainer>
  );
};

export default Output;
