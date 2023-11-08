import React from "react";
import styled from "styled-components";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Container = styled.div`
  width: 100%;
  height: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  margin-bottom: 1rem;
`;

const Body = styled.div`
    width: 100%;
    height: 100%;
    display flex;
`;

const EditorLoading = () => {
  return (
    <SkeletonTheme highlightColor="#A0AEC0" baseColor="#EDF2F7">
      <Container>
        <Header>
          <Skeleton style={{ width: "100px", height: "50px" }} />
          <Skeleton style={{ width: "100px", height: "50px" }} />
        </Header>
        <Body>
          <Skeleton style={{ width: "100%", height: "100%" }} />
        </Body>
      </Container>
    </SkeletonTheme>
  );
};

export default EditorLoading;
