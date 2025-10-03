import React from 'react';
import styled from 'styled-components';
import { Button } from '../atoms/Button';

const StyledHeader = styled.header`
    padding: 1.5rem 2rem;
    background: ${({ theme }) => theme.ui_bg};
    border-bottom: 1px solid ${({ theme }) => theme.ui_bg_hover};
`;

interface HeaderProps {
    onSelectFolder: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSelectFolder }) => {
    return (
        <StyledHeader>
            <Button onClick={onSelectFolder}>Selecionar outra pasta de músicas</Button>
        </StyledHeader>
    );
};