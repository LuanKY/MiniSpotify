import React from 'react';
import styled from 'styled-components';
import { Track } from '../../services/drive';
import { Text } from '../atoms/Text';

const PlaylistContainer = styled.div`flex-grow: 1; overflow-y: auto; padding: 2rem;`;

const PlaylistItem = styled.div<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  background-color: ${({ theme, $isActive }) => $isActive ? theme.ui_bg_hover : 'transparent'};
  &:hover {
    background-color: ${({ theme }) => theme.ui_bg_hover};
  }
`;

interface PlaylistProps {
    tracks: Track[];
    currentTrack: Track | null;
    onTrackSelect: (index: number) => void;
}

export const Playlist: React.FC<PlaylistProps> = ({ tracks, currentTrack, onTrackSelect }) => {
    if (tracks.length === 0) {
        return (
            <PlaylistContainer style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text muted>Sua playlist aparecerá aqui.</Text>
            </PlaylistContainer>
        );
    }

    return (
        <PlaylistContainer>
            {tracks.map((track, index) => (
                <PlaylistItem key={track.id} $isActive={currentTrack?.id === track.id} onClick={() => onTrackSelect(index)}>
                    <Text $weight="500">{index + 1}.</Text>
                    <Text>{track.name.replace(/\.mp3|\.m4a|\.flac/gi, '')}</Text>
                </PlaylistItem>
            ))}
        </PlaylistContainer>
    );
};