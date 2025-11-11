import React from 'react';
import styled from 'styled-components';
import { Button } from '../atoms/Button';
import { IconButton } from '../atoms/IconButton';
import { DownloadIcon, FolderIcon, MoonIcon, SunIcon } from '../atoms/Icons';

const StyledHeader = styled.header`
    display: flex;
    align-items: center;
    justify-content: space-between; 
    padding: 1rem 1.5rem;
    background: ${({ theme }) => theme.ui_bg};
    border-bottom: 1px solid ${({ theme }) => theme.ui_bg_hover};
`;

const HeaderControls = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem; 
`;

const DesktopButton = styled(Button)`
    @media (max-width: 600px) {
        display: none; 
    }
`;

const MobileButton = styled(IconButton)`
    display: none; 
    
    @media (max-width: 600px) {
        display: flex; 
        background-color: ${({ theme }) => theme.accent}; 
        color: white;
        
        &:hover {
            background-color: #1ed760;
        }
    }
`;

interface HeaderProps {
    onSelectFolder: () => void;
    onInstall: () => void;
    onToggleTheme: () => void;
    themeName: string;
    showInstallButton: boolean;
}

export const Header: React.FC<HeaderProps> = ({
    onSelectFolder,
    onInstall,
    onToggleTheme,
    themeName,
    showInstallButton
}) => {
    return (
        <StyledHeader>
            <DesktopButton onClick={onSelectFolder}>
                Selecionar pasta de músicas
            </DesktopButton>

            <MobileButton onClick={onSelectFolder} title="Selecionar pasta">
                <FolderIcon />
            </MobileButton>

            <HeaderControls>
                {showInstallButton && (
                    <IconButton onClick={onInstall} title="Instalar App">
                        <DownloadIcon />
                    </IconButton>
                )}
                <IconButton onClick={onToggleTheme}>
                    {themeName === 'light' ? <MoonIcon /> : <SunIcon />}
                </IconButton>
            </HeaderControls>
        </StyledHeader>
    );
};