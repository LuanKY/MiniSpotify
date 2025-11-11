import React from 'react';
import styled from 'styled-components';
import { Track } from '../../services/drive';
import { formatTime } from '../../utils/formatTime';
import { IconButton } from '../atoms/IconButton';
import { MusicIcon, PauseIcon, PlayIcon, SkipNextIcon, SkipPreviousIcon } from '../atoms/Icons';
import { ProgressBarContainer, ProgressFill } from '../atoms/ProgressBar';
import { Spinner } from '../atoms/Spinner';
import { Text } from '../atoms/Text';

const PlayerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background-color: ${({ theme }) => theme.ui_bg};
  box-shadow: ${({ theme }) => theme.shadow};
  border-top: 1px solid ${({ theme }) => theme.ui_bg_hover};

  @media (max-width: 768px) {
    flex-wrap: wrap; 
    justify-content: center; 
    padding: 1rem;
  }
`;

const PlayerCenter = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  max-width: 600px;
  margin: 0 1rem;

  @media (max-width: 768px) {
    width: 100%; 
    margin: 0.5rem 0 0 0; 
    order: 2; 
  }
`;

const TrackInfoContainer = styled.div`
  min-width: 200px;
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    min-width: auto;
    flex-basis: 100%; 
    justify-content: center;
    order: 1; 
    margin-bottom: 0.5rem;
  }
`;

const RightSpacer = styled.div`
  min-width: 200px;
  @media (max-width: 768px) {
    display: none; 
  }
`;

interface PlayerProps {
    track: Track | null; isPlaying: boolean; progress: number; duration: number; currentTime: number;
    onPlayPause: () => void; onNext: () => void; onPrev: () => void; onSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
    isTrackLoading: boolean;
}

export const Player: React.FC<PlayerProps> = ({ track, isPlaying, progress, duration, currentTime, onPlayPause, onNext, onPrev, onSeek, isTrackLoading }) => {
    return (
        <PlayerContainer>
            <TrackInfoContainer>
                {isTrackLoading && <Spinner style={{ width: '24px', height: '24px', borderTopColor: '#fff' }} />}
                {!isTrackLoading && track && <MusicIcon />}
                <div>
                    <Text $weight="600">{track ? track.name.replace(/\.mp3|\.m4a|\.flac/gi, '') : "Nenhuma música"}</Text>
                    {track && <Text size="0.8rem" muted>Música do Drive</Text>}
                </div>
            </TrackInfoContainer>

            <PlayerCenter>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                    <IconButton onClick={onPrev} disabled={!track}><SkipPreviousIcon /></IconButton>
                    <IconButton onClick={onPlayPause} disabled={!track || isTrackLoading} style={{ width: 60, height: 60, color: 'white', backgroundColor: track ? '#1db954' : '#ccc' }}>
                        {isPlaying ? <PauseIcon /> : <PlayIcon />}
                    </IconButton>
                    <IconButton onClick={onNext} disabled={!track}><SkipNextIcon /></IconButton>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: '1rem' }}>
                    <Text size="0.8rem">{formatTime(currentTime)}</Text>
                    <ProgressBarContainer onClick={onSeek}><ProgressFill $progress={progress} /></ProgressBarContainer>
                    <Text size="0.8rem">{formatTime(duration)}</Text>
                </div>
            </PlayerCenter>

            <RightSpacer />
        </PlayerContainer>
    );
};