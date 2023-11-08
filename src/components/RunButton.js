import React from "react";
import styled from "styled-components";
import { FidgetSpinner } from "react-loader-spinner";

export const Button = styled.button`
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
  height: 2.5rem;
  min-width: 2.5rem;
  font-size: 1rem;
  padding-inline-start: 1rem;
  padding-inline-end: 1rem;
  background: #edf2f7;
  color: #132b3e;
  cursor: pointer;

  &&:hover {
    background: #e2e8f0;
  }
`;

const RunButton = ({ onClickFn, isLoading }) => {
  return (
    <Button onClick={onClickFn}>
      {!isLoading && "Run"}
      {isLoading && (
        <FidgetSpinner
          visible={true}
          height="35"
          width="35"
          ariaLabel="dna-loading"
          wrapperStyle={{}}
          wrapperClass="dna-wrapper"
          ballColors={["#e53e3e", "#000", "#2c7fab"]}
          backgroundColor="#132b3e"
        />
      )}
    </Button>
  );
};

export default RunButton;
