import styled from 'styled-components';

export const ProgressBarContainer = styled.div`
  width: 100%;
  height: 4px;
  background-color: ${({ theme }) => theme.highlight};
  border-radius: 2px;
  cursor: pointer;
  position: relative;
`;

export const ProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${({ $progress }) => $progress}%;
  background-color: ${({ theme }) => theme.accent};
  border-radius: 2px;
  transition: width 0.1s linear;
`;