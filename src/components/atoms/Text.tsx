import styled from 'styled-components';

export const Text = styled.p<{
  size?: string;
  $weight?: '400' | '500' | '600' | '700';
  muted?: boolean;
}>`
  font-size: ${({ size }) => size || '1rem'};
  font-weight: ${({ $weight }) => $weight || '400'};
  color: ${({ theme, muted }) => (muted ? theme.highlight : theme.text)};
  margin: 0;
  line-height: 1.5;
`;