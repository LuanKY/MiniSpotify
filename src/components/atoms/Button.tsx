import styled from 'styled-components';

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${({ theme }) => theme.accent};
  color: #ffffff;

  &:hover {
    background-color: #1ed760;
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    background-color: ${({ theme }) => theme.ui_bg_hover};
    color: ${({ theme }) => theme.highlight};
    cursor: not-allowed;
  }
`;