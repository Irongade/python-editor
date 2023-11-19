import React from "react";

import styled from "styled-components";
import parse from "html-react-parser";

const QuestionTitle = styled.h1`
  font-size: 24px;
  line-height: 32px;
  font-weight: 900;
  margin-bottom: 1rem;
`;

const QuestionDescription = styled.p`
  font-size: 16px;
  line-height: 32px;
  margin-bottom: 0.5rem;
`;

const QuestionSubTitle = styled.h4`
  font-size: 16px;
  line-height: 32px;
  margin: 0;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
`;

const QuestionSubDescription = styled.p`
  font-size: 16px;
  line-height: 28px;
  margin-bottom: 0.3rem;
`;

const QuestionSubDescriptionContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const QuestionCodeText = styled.code`
  background-color: #000a2008;
  border-color: #0000000d;
  border-radius: 5px;
  border-width: 1px;
  color: #132b3e;
  font-family: Menlo, sans-serif;
  font-size: 0.75rem;
  line-height: 1rem;
  padding: 0.125rem;
  white-space: pre-wrap;
  width: fit-content;
`;

const QuestionConstraintText = styled.p`
  color: #132b3e;
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1rem;
  white-space: pre-wrap;
`;

const QuestionSubContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: auto;
`;

const Question = ({ question }) => {
  return (
    <div>
      <QuestionTitle>{question.title}</QuestionTitle>

      <QuestionDescription>{parse(question.subText1)}</QuestionDescription>

      <QuestionDescription>{parse(question.subText2)}</QuestionDescription>

      {question.subText3 && (
        <QuestionDescription>{parse(question.subText3)}</QuestionDescription>
      )}

      <QuestionSubContainer>
        {question.examples.length > 0 &&
          question.examples.map((example) => (
            <div key={example.id}>
              <QuestionSubTitle>{example.title}</QuestionSubTitle>
              <QuestionSubDescriptionContainer>
                <QuestionSubDescription>{example.input}</QuestionSubDescription>
                <QuestionSubDescription>
                  {example.output}
                </QuestionSubDescription>
                <QuestionSubDescription>
                  {example.explanation}
                </QuestionSubDescription>
              </QuestionSubDescriptionContainer>
            </div>
          ))}
      </QuestionSubContainer>

      <QuestionSubTitle>Constraints:</QuestionSubTitle>
      <QuestionSubContainer>
        {question.constraints.length > 0 &&
          question.constraints.map((constraint, index) => (
            <>
              {constraint.isCode && (
                <QuestionCodeText key={index}>
                  {parse(constraint.text)}
                </QuestionCodeText>
              )}

              {!constraint.isCode && (
                <QuestionConstraintText key={index}>
                  {constraint.text}
                </QuestionConstraintText>
              )}
            </>
          ))}
      </QuestionSubContainer>
    </div>
  );
};

export default Question;
