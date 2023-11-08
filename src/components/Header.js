import React from "react";
import RunButton from "./RunButton";
import styled from "styled-components";

const HeaderContainer = styled.div`
  width: 97.8%;
  display: flex;
  height: 5%;
  justify-content: space-between;
  align-items: center;
  background: white;
  margin-top: 1rem;
  margin-bottom: 1rem;
  margin: 1rem auto;
  padding: 1.25rem 1rem;
  box-sizing: border-box;
  border-radius: 8px;
  margin-bo
`;

const QuestionNumberContainer = styled.h2``;

const NextQuestionContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 15%;
`;

const Btn = styled.button`
  display: inline-flex;
  appearance: none;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: center;
  justify-content: center;
  user-select: none;
  position: relative;
  white-space: nowrap;
  vertical-align: middle;
  outline: none;
  line-height: 1.2;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  height: 1.5rem;
  min-width: 2.5rem;
  font-size: 0.875rem;
  padding-inline-start: 0.5rem;
  padding-inline-end: 0.5rem;
  background: #edf2f7;
  color: #132b3e;
  cursor: pointer;

  &&:hover {
    background: #e2e8f0;
  }
`;

const Header = ({ onClickFn, questionNo }) => {
  return (
    <HeaderContainer>
      <QuestionNumberContainer>Question {questionNo}</QuestionNumberContainer>

      <NextQuestionContainer>
        <Btn onClick={() => onClickFn(false)}>Prev Question</Btn>
        <Btn onClick={() => onClickFn(true)}>Next Question</Btn>
      </NextQuestionContainer>
    </HeaderContainer>
  );
};

export default Header;
