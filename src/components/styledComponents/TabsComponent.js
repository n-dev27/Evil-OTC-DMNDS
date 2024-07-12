import React from "react";
import styled from "styled-components";

const StyledTabs = styled.nav`
  display: flex;
  justify-content: stretch;
  max-width: 447px;
  width: 5/6;
  margin: auto;
  background-color: rgba(53, 61, 71, 0.1);
  border: 1px solid rgba(53, 61, 71, 0.2);
  border-radius: 8px;
`;

const subTabs = ({ value }) => {
  return (
    <StyledTabs value={value}>
    </StyledTabs>
  );
};

export default subTabs;