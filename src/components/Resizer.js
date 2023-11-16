import React, { useState, useEffect, useRef, useCallback } from "react";
import styled from "styled-components";

const ResizerDragger = styled.div`
  border: solid 0 #e2e8f0;
  margin: 5px;
  cursor: ${(props) =>
    props.orientation === "horizontal" ? "ew-resize" : "ns-resize"};
  position: relative;

  ${(props) =>
    props.orientation === "horizontal"
      ? `
  height: 100%;
  width: 8px;
  `
      : `
  width: 100px;
  height: 8px;
  `}

  &&&::after {
    background-color: #00000014;
    border-radius: 2px;
    border: solid 0 #e2e8f0;

    content: "";
    left: 41%;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    ${(props) =>
      props.orientation === "horizontal"
        ? `
    height: 24px;
    width: 2px;
    `
        : `
    width: 24px;
    height: 2px;
    `}
  }
`;

const Resizer = ({ direction = "horizontal" }) => {
  const resizer = useRef(null);
  const [leftElement, setLeftElement] = useState(null);
  const [rightElement, setRightElement] = useState(null);

  const [leftWidth, setLeftWidth] = useState(0);
  const [leftHeight, setLeftHeight] = useState(0);

  const [xPos, setXPos] = useState(0);
  const [yPos, setYPos] = useState(0);

  const mouseMoveHandler = useCallback(
    (e) => {
      const dx = e.clientX - xPos;
      const dy = e.clientY - yPos;

      switch (direction) {
        case "vertical":
          const newLeftHeight =
            ((leftHeight + dy) * 100) /
            resizer.current.parentNode.getBoundingClientRect().height;

          leftElement.style.height = `${newLeftHeight}%`;

          break;
        case "horizontal":
          const newLeftWidth =
            ((leftWidth + dx) * 100) /
            resizer.current.parentNode.getBoundingClientRect().width;

          leftElement.style.width = `${newLeftWidth}%`;

          break;
        default:
          console.log("impossible case");
          break;
      }

      const cursor = direction === "horizontal" ? "ew-resize" : "ns-resize";

      resizer.current.style.cursor = cursor;
      document.body.style.cursor = cursor;

      leftElement.style.userSelect = "none";
      leftElement.style.pointerEvents = "none";

      rightElement.style.userSelect = "none";
      rightElement.style.pointerEvents = "none";
    },
    [direction, leftElement, leftHeight, leftWidth, rightElement, xPos, yPos]
  );

  const mouseUpHandler = useCallback(() => {
    console.log("mouseup");
    resizer.current.style.removeProperty("cursor");
    document.body.style.removeProperty("cursor");

    leftElement.style.removeProperty("user-select");
    leftElement.style.removeProperty("pointer-events");

    rightElement.style.removeProperty("user-select");
    rightElement.style.removeProperty("pointer-events");

    document.removeEventListener("mousemove", mouseMoveHandler);
    document.removeEventListener("mouseup", mouseUpHandler);
  }, [leftElement, mouseMoveHandler, rightElement]);

  const mouseDownHandler = useCallback(
    (e) => {
      console.log("mousedown");
      setXPos(e.clientX);
      setYPos(e.clientY);

      setLeftWidth(leftElement.getBoundingClientRect().width);
      setLeftHeight(leftElement.getBoundingClientRect().height);

      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", mouseUpHandler);
    },
    [leftElement, mouseMoveHandler, mouseUpHandler]
  );

  useEffect(() => {
    const resizerElement = resizer.current;

    if (resizerElement) {
      setLeftElement(resizerElement.previousElementSibling);
      setRightElement(resizerElement.nextElementSibling);

      resizerElement.addEventListener("mousedown", mouseDownHandler);
      resizerElement.addEventListener("mouseup", mouseUpHandler);
    }

    return () => {
      resizerElement.removeEventListener("mousedown", mouseDownHandler);
      resizerElement.removeEventListener("mouseup", mouseUpHandler);
    };
  }, [mouseDownHandler, mouseUpHandler, resizer]);

  return (
    <ResizerDragger
      ref={resizer}
      className="resizer"
      id="dragMe"
      orientation={direction}
    ></ResizerDragger>
  );
};

export default Resizer;
