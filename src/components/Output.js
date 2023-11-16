import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

const OutputContainer = styled.div`
  width: 100%;
  display: flex;
  height: auto;
  flex-direction: column;
  height: 100%;
  padding: 1rem;
  box-sizing: border-box;

  & .react-tabs__tab-list {
    border: none;
    margin-bottom: 1rem;
  }

  & .react-tabs__tab--selected {
    border: none;
  }

  & .react-tabs__tab--selected div {
    background-color: #000a200d;
  }

  & .react-tabs__tab--selected span {
    color: black;
  }

  & .react-tabs__tab {
    padding: 0;
    padding-right: 1rem;
  }
`;

const ResultsWrapper = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
`;

const ResultDisplay = styled.div`
  width: 100%;
  display: flex;
  height: ${(props) => (props?.height ? props.height : "86.3px")};
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
  margin-bottom: 10px;

  & p {
    font-size: 12px;
  }
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  height: 10%;
  box-sizing: border-box;
`;

const HeaderText = styled.h4`
  font-size: 0.9rem;
  color: #132b3e;
  margin: 0;
  margin-bottom: 10px;
`;

const HeaderSubText = styled.h4`
  font-size: 0.65rem;
  color: #3c3c4399;
  margin: 0;
  padding-bottom: 5px;
`;

const Result = styled.div`
  width: 100%;
  display: flex;
  box-sizing: border-box;
  padding-bottom: 0.75rem;
`;

const ResultText = styled.h4`
  font-size: 1rem;
  color: ${(props) => (props.correct ? "rgba(45 181 93)" : "rgba(239 71 67)")};
  margin: 0;
`;

const TablistContainer = styled.div`
  width: 50%;
  display: flex;
  height: auto;
`;

const TestCaseContainer = styled.div`
  width: 100%;
  display: flex;
  height: auto;
  flex-direction: row;
  padding-bottom: 0.5rem;
  gap: 0.5rem;
`;

const TestCase = styled.div`
  color: #3c3c4399;
  font-weight: 500;
  padding-bottom: 0.25rem;
  padding-top: 0.25rem;
  padding-left: 1rem;
  padding-right: 1rem;
  border-radius: 0.5rem;
  cursor: pointer;

  display: flex;
  flex-direction: row;
  align-items: center;
  &:hover {
    background-color: #000a200d;
  }
`;

const ResultIndicator = styled.span`
  background-color: ${(props) =>
    props.correct ? "rgba(45 181 93)" : "rgba(239 71 67)"};
  border-radius: 9999px;
  width: 0.25rem;
  height: 0.25rem;
  margin-right: 8px;
`;

const Output = ({ output, currentQuestion }) => {
  const [currentTest, setCurrentTest] = useState(
    currentQuestion.tests[0].title
  );

  const [currentConsoleTest, setCurrentConsoleTest] = useState(
    currentQuestion.tests[0].title
  );

  const didTestFail = useMemo(() => {
    return output && output[currentTest].isError;
  }, [currentTest, output]);

  return (
    <OutputContainer>
      <Tabs>
        <TablistContainer>
          <TabList>
            <Tab>
              <TestCase>Results</TestCase>
            </Tab>
            <Tab>
              <TestCase>Console</TestCase>
            </Tab>
          </TabList>
        </TablistContainer>

        <TabPanel>
          {output && didTestFail && (
            <Result>
              <ResultText>Wrong Answer</ResultText>
            </Result>
          )}
          {output && !didTestFail && (
            <Result>
              <ResultText correct>Accepted</ResultText>
            </Result>
          )}

          <ResultsWrapper>
            <>
              <Tabs>
                <TabList>
                  {currentQuestion.tests.map((test, index) => (
                    <>
                      <Tab
                        onClick={() => setCurrentTest(test.title)}
                        key={test.id}
                      >
                        <TestCase>
                          {output[test.title] && output[test.title] && (
                            <ResultIndicator
                              correct={!output[test.title].isError}
                            />
                          )}
                          <span>Case {index + 1} </span>
                        </TestCase>
                      </Tab>
                    </>
                  ))}
                </TabList>

                {currentQuestion.tests.map((test) => {
                  const testOutput = output[test.title];
                  return (
                    <TabPanel key={test.id}>
                      <HeaderText>Input</HeaderText>
                      <ResultDisplay height={"auto"}>
                        <HeaderSubText>input =</HeaderSubText>
                        <p>{test.input}</p>
                      </ResultDisplay>

                      <HeaderText>Expected Output</HeaderText>
                      <ResultDisplay height={"auto"}>
                        <HeaderSubText>output =</HeaderSubText>
                        <p>{test.expectedAnswer}</p>
                      </ResultDisplay>

                      <HeaderText>Actual Output</HeaderText>
                      <ResultDisplay height={"55px"}>
                        <p>{testOutput && testOutput.result}</p>
                      </ResultDisplay>
                    </TabPanel>
                  );
                })}
              </Tabs>
              {/* <TestCaseContainer>
                  <TestCase> Case 1 </TestCase>
                  <TestCase> Case 2 </TestCase>
                  <TestCase> Case 3 </TestCase>
                </TestCaseContainer> */}

              {/* <ResultDisplay height={"auto"}>{output.result}</ResultDisplay>x */}
            </>
          </ResultsWrapper>
        </TabPanel>
        <TabPanel>
          <ResultsWrapper>
            <Tabs>
              <TabList>
                {currentQuestion.tests.map((test, index) => (
                  <>
                    <Tab
                      onClick={() => setCurrentConsoleTest(test.title)}
                      key={test.id}
                    >
                      <TestCase>
                        {output[test.title] && output[test.title] && (
                          <ResultIndicator
                            correct={!output[test.title].isError}
                          />
                        )}
                        <span>Case {index + 1} </span>
                      </TestCase>
                    </Tab>
                  </>
                ))}
              </TabList>

              {currentQuestion.tests.map((test) => {
                const testConsole = output[test.title];
                return (
                  <TabPanel key={test.id}>
                    <ResultDisplay height={"200px"}>
                      {testConsole &&
                        testConsole.consoleOutput &&
                        testConsole.consoleOutput.map((c) => (
                          <p style={{ marginBottom: "8px" }}>{c}</p>
                        ))}
                    </ResultDisplay>
                  </TabPanel>
                );
              })}
            </Tabs>
          </ResultsWrapper>
        </TabPanel>
      </Tabs>
    </OutputContainer>
  );
};

export default Output;
