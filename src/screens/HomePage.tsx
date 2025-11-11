import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useGoogleAPIs } from '../hooks/useGoogleAPIs';
import { fetchSongsFromFolder, fetchAudioBlobUrl, Track } from '../services/drive';
import { Header } from '../components/molecules/Header';
import { Playlist } from '../components/molecules/Playlist';
import { Player } from '../components/molecules/Player';
import { Text } from '../components/atoms/Text';
import { Button } from '../components/atoms/Button';
import { IconButton } from '../components/atoms/IconButton';
import { Spinner } from '../components/atoms/Spinner';
import { DownloadIcon, MoonIcon, SunIcon } from '../components/atoms/Icons';

const AppContainer = styled.div`display: flex; flex-direction: column; height: 100vh; width: 100vw;`;
const FullScreenOverlay = styled.div`position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: ${({ theme }) => theme.body}; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; z-index: 100; padding: 2rem; text-align: center;`;
const HeaderControls = styled.div`display: flex; align-items: center; gap: 1rem; position: absolute; top: 1.5rem; right: 1.5rem; z-index: 10;`;
const ResponsiveTitle = styled(Text)`font-size: 2rem; @media (max-width: 480px) { font-size: 1.5rem; }`;

const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

interface HomePageProps {
    toggleTheme: () => void;
    themeName: string;
}

export const HomePage: React.FC<HomePageProps> = ({ toggleTheme, themeName }) => {
    
    const [tracks, setTracks] = useState<Track[]>(() => {
        const savedTracks = localStorage.getItem('miniSpotify_tracks');
        return savedTracks ? JSON.parse(savedTracks) : [];
    });
    
    const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(() => {
        const savedIndex = localStorage.getItem('miniSpotify_lastTrackIndex');
        return savedIndex ? JSON.parse(savedIndex) : null;
    });

    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    
    const [accessToken, setAccessToken] = useState<string | null>(() => {
        const storedTokenData = localStorage.getItem('googleToken');
        if (!storedTokenData) return null;
        try {
            const tokenData = JSON.parse(storedTokenData);
            if (tokenData.expiry > Date.now()) return tokenData.token;
        } catch (e) { console.error("Falha ao ler token salvo:", e); }
        localStorage.removeItem('googleToken');
        return null;
    });

    const [isPlaylistLoading, setIsPlaylistLoading] = useState(false);
    const [isTrackLoading, setIsTrackLoading] = useState(false);
    const [apiMessage, setApiMessage] = useState<string>("Carregando APIs do Google...");
    const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const trackUrlCache = useRef<Map<string, string>>(new Map());

    const handleLogout = () => {
        localStorage.removeItem('googleToken');
        localStorage.removeItem('miniSpotify_tracks');
        localStorage.removeItem('miniSpotify_lastTrackIndex');
        setAccessToken(null);
        setTracks([]);
        setCurrentTrackIndex(null);
    };

    const handleAuth = (tokenResponse: any) => {
        if (tokenResponse.access_token) {
            const expiry = Date.now() + (tokenResponse.expires_in * 1000);
            localStorage.setItem('googleToken', JSON.stringify({ token: tokenResponse.access_token, expiry: expiry }));
            setAccessToken(tokenResponse.access_token);
        }
    };

    const { ready: apiReady, error: apiError } = useGoogleAPIs(handleAuth);

    useEffect(() => { if (apiError) setApiMessage(apiError); else if (apiReady) setApiMessage("Tudo pronto. Por favor, conecte-se."); }, [apiReady, apiError]);

    const handleLogin = () => { if (apiReady && window.tokenClient) window.tokenClient.requestAccessToken({ prompt: 'consent' }); };
    
    const showPicker = () => {
        if (!accessToken || !apiReady) return;
        const view = new window.google.picker.DocsView().setIncludeFolders(true).setMimeTypes('application/vnd.google-apps.folder').setSelectFolderEnabled(true);
        const picker = new window.google.picker.PickerBuilder().enableFeature(window.google.picker.Feature.NAV_HIDDEN).setAppId(SCOPES).setOAuthToken(accessToken).addView(view).setDeveloperKey(import.meta.env.VITE_GOOGLE_API_KEY).setCallback(pickerCallback).build();
        picker.setVisible(true);
    };

    const pickerCallback = (data: any) => { if (data.action === window.google.picker.Action.PICKED && data.docs?.[0]) handleFetchSongs(data.docs[0].id); };

    const handleFetchSongs = async (folderId: string) => {
        setIsPlaylistLoading(true);
        setTracks([]);
        setCurrentTrackIndex(null); 
        localStorage.removeItem('miniSpotify_lastTrackIndex'); 
        try {
            const files = await fetchSongsFromFolder(folderId);
            if (files.length > 0) {
                setTracks(files);
                localStorage.setItem('miniSpotify_tracks', JSON.stringify(files)); 
            } else {
                alert("Nenhuma música encontrada na pasta selecionada.");
                localStorage.removeItem('miniSpotify_tracks'); 
            }
        } catch (error: any) {
            console.error("Erro ao buscar músicas:", error);
            if (error?.result?.error?.code === 401) {
                alert("Sua sessão expirou.");
                handleLogout(); 
            } else alert("Não foi possível buscar as músicas.");
        }
        setIsPlaylistLoading(false);
    };
    
    const currentTrack = currentTrackIndex !== null ? tracks[currentTrackIndex] : null;

    useEffect(() => {
        if (!currentTrack || !accessToken || !audioRef.current) return;
        const audio = audioRef.current;
        let isActive = true;
        const loadAndPlayAudio = async () => {
            setIsTrackLoading(true);
            try {
                let blobUrl = trackUrlCache.current.get(currentTrack.id);
                if (!blobUrl) {
                    blobUrl = await fetchAudioBlobUrl(currentTrack.id, accessToken);
                    trackUrlCache.current.set(currentTrack.id, blobUrl);
                }
                if (isActive) {
                    audio.src = blobUrl;
                    if (isPlaying) await audio.play();
                }
            } catch (error: any) {
                console.error("Erro ao carregar e tocar música:", error.message);
                if (error.message.includes('401')) {
                    alert("Sua sessão expirou. Por favor, faça login novamente.");
                    handleLogout();
                }
            } finally { if (isActive) setIsTrackLoading(false); }
        };
        loadAndPlayAudio();
        return () => { isActive = false; }
    }, [currentTrack, accessToken]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying && audio.src && audio.paused) audio.play().catch(e => console.error("Erro ao dar play:", e));
        else if (!isPlaying && !audio.paused) audio.pause();
    }, [isPlaying]);

    useEffect(() => {
        if (currentTrackIndex !== null) {
            localStorage.setItem('miniSpotify_lastTrackIndex', JSON.stringify(currentTrackIndex));
        }
    }, [currentTrackIndex]);
    
    const handlePlayPause = () => { if (currentTrackIndex === null && tracks.length > 0) { setCurrentTrackIndex(0); } setIsPlaying(!isPlaying); };
    const handleTrackSelect = (index: number) => { if (index === currentTrackIndex) { setIsPlaying(!isPlaying); } else { setCurrentTrackIndex(index); setIsPlaying(true); } };
    const handleNext = () => { if (currentTrackIndex !== null) { setCurrentTrackIndex(prev => (prev! + 1) % tracks.length); setIsPlaying(true); } };
    const handlePrev = () => { if (currentTrackIndex !== null) { setCurrentTrackIndex(prev => (prev! - 1 + tracks.length) % tracks.length); setIsPlaying(true); } };
    const onTimeUpdate = () => { const audio = audioRef.current; if (audio?.duration) { setProgress((audio.currentTime / audio.duration) * 100); setCurrentTime(audio.currentTime); } };
    const onLoadedMetadata = () => { if (audioRef.current) setDuration(audioRef.current.duration); };
    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => { const audio = audioRef.current; if (audio?.duration) audio.currentTime = (e.clientX - e.currentTarget.getBoundingClientRect().left) / e.currentTarget.offsetWidth * audio.duration; };
    
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').catch(err => console.log('Falha no registro do SW: ', err));
            });
        }
        const handleInstallPrompt = (e: Event) => { e.preventDefault(); setInstallPromptEvent(e); };
        window.addEventListener('beforeinstallprompt', handleInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    }, []);

    const handleInstallClick = () => { if (installPromptEvent) { installPromptEvent.prompt(); } };

    if (!accessToken) {
        return (
            <FullScreenOverlay>
                <HeaderControls>
                    {installPromptEvent && <IconButton onClick={handleInstallClick} title="Instalar App"><DownloadIcon /></IconButton>}
                    <IconButton onClick={toggleTheme}>{themeName === 'light' ? <MoonIcon /> : <SunIcon />}</IconButton>
                </HeaderControls>
                <ResponsiveTitle $weight="700">Bem-vindo ao MiniSpotify</ResponsiveTitle>
                <Text muted>Conecte-se com sua conta Google para ouvir suas músicas do Drive.</Text>
                <Button onClick={handleLogin} disabled={!apiReady}>{apiReady ? 'Conectar com Google Drive' : 'Carregando...'}</Button>
                <Text size="0.8rem" muted>{apiMessage}</Text>
                {apiError && <Text size="0.9rem" style={{color: '#ef4444'}}>Por favor, verifique se você substituiu a API Key e o Client ID.</Text>}
            </FullScreenOverlay>
        );
    }
    
    return (
        <AppContainer>
             <Header 
                onSelectFolder={showPicker}
                onInstall={handleInstallClick}
                onToggleTheme={toggleTheme}
                themeName={themeName}
                showInstallButton={!!installPromptEvent}
             />
            <audio ref={audioRef} onTimeUpdate={onTimeUpdate} onLoadedMetadata={onLoadedMetadata} onEnded={handleNext} />
            
            {isPlaylistLoading ? (
                <div style={{flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Spinner />
                </div>
            ) : (
                <Playlist
                    tracks={tracks} 
                    currentTrack={currentTrack} 
                    onTrackSelect={handleTrackSelect}
                />
            )}
            <Player 
                track={currentTrack} 
                isPlaying={isPlaying} 
                onPlayPause={handlePlayPause} 
                onNext={handleNext} 
                onPrev={handlePrev} 
                progress={progress} 
                duration={duration} 
                onSeek={handleSeek} 
                currentTime={currentTime}
                isTrackLoading={isTrackLoading}
            />
        </AppContainer>
    );
}