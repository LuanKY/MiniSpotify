import styled from 'styled-components';

export const IconButton = styled.button`
  background: none;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${({ theme }) => theme.text};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.ui_bg_hover};
  }
  
  svg {
    width: 24px;
    height: 24px;
  }
`;