import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, createGlobalStyle, ThemeProvider } from 'styled-components';

// --- TYPE DEFINITIONS ---
interface Track {
    id: string;
    name: string;
    webContentLink: string;
}

interface Theme {
    body: string; text: string; accent: string; ui_bg: string; ui_bg_hover: string; shadow: string; highlight: string;
}

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}

interface Gapi {
    client: {
        init: (config: object) => Promise<void>;
        drive: {
            files: {
                list: (params: object) => Promise<any>;
            };
        };
    };
    load: (api: string, callback: () => void) => void;
}

interface Google {
    accounts: { oauth2: { initTokenClient: (config: object) => any; }; };
    picker: { DocsView: new () => any; PickerBuilder: new () => any; Feature: { NAV_HIDDEN: string }; Action: { PICKED: string }; };
}

declare global {
    interface Window { gapi: Gapi; google: Google; tokenClient: any; }
}

// --- CONFIGURAÇÕES E CONSTANTES ---
const GOOGLE_API_KEY = "AIzaSyBnsiBMGNUbbOD5r09fStDYgh0oyFgEVcA"; 
const GOOGLE_CLIENT_ID = "475667636652-hq3cjsi5k3svm0p83hjubcrnr91rj8cj.apps.googleusercontent.com"; 
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

// --- TEMAS (Dark & Light) ---
const lightTheme: Theme = { body: '#f1f5f9', text: '#0f172a', accent: '#1db954', ui_bg: '#ffffff', ui_bg_hover: '#e2e8f0', shadow: '0 4px 12px rgba(0, 0, 0, 0.1)', highlight: '#cbd5e1' };
const darkTheme: Theme = { body: '#0f172a', text: '#f1f5f9', accent: '#1db954', ui_bg: '#1e293b', ui_bg_hover: '#334155', shadow: '0 4px 12px rgba(0, 0, 0, 0.4)', highlight: '#475569' };

// --- ESTILOS GLOBAIS ---
const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background-color: ${({ theme }) => theme.body}; color: ${({ theme }) => theme.text}; transition: background-color 0.3s ease, color 0.3s ease; -webkit-font-smoothing: antialiased; overflow: hidden; }
`;

// ====================================================================
// --- COMPONENTES VISUAIS (styled-components) ---
// ====================================================================

const spin = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;
const Spinner = styled.div`border: 4px solid ${({ theme }) => theme.ui_bg_hover}; border-top: 4px solid ${({ theme }) => theme.accent}; border-radius: 50%; width: 40px; height: 40px; animation: ${spin} 1s linear infinite;`;
const AppContainer = styled.div`display: flex; flex-direction: column; height: 100vh; width: 100vw;`;
// CORREÇÃO: Usando transient prop ($weight) para evitar erro no console.
const Text = styled.p<{ size?: string; $weight?: string; muted?: boolean }>`
  font-size: ${({ size }) => size || '1rem'};
  font-weight: ${({ $weight }) => $weight || '400'};
  color: ${({ theme, muted }) => muted ? theme.highlight : theme.text};
  margin: 0; line-height: 1.5;
`;
const Button = styled.button`display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border-radius: 50px; border: none; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; background-color: ${({ theme }) => theme.accent}; color: #ffffff; &:hover { background-color: #1ed760; } &:active { transform: scale(0.98); } &:disabled { background-color: ${({ theme }) => theme.ui_bg_hover}; color: ${({ theme }) => theme.highlight}; cursor: not-allowed; }`;
const IconButton = styled.button`background: none; border: none; border-radius: 50%; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: ${({ theme }) => theme.text}; transition: background-color 0.2s ease; &:hover { background-color: ${({ theme }) => theme.ui_bg_hover}; } svg { width: 24px; height: 24px; }`;
const ProgressBarContainer = styled.div`width: 100%; height: 4px; background-color: ${({ theme }) => theme.highlight}; border-radius: 2px; cursor: pointer;`;
const ProgressFill = styled.div<{ $progress: number }>`height: 100%; width: ${({ $progress }) => $progress}%; background-color: ${({ theme }) => theme.accent}; border-radius: 2px; transition: width 0.1s linear;`;
const PlayerContainer = styled.div`display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem; background-color: ${({ theme }) => theme.ui_bg}; box-shadow: ${({ theme }) => theme.shadow}; border-top: 1px solid ${({ theme }) => theme.ui_bg_hover};`;
const PlayerCenter = styled.div`flex-grow: 1; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; max-width: 600px; margin: 0 1rem;`;
const PlaylistContainer = styled.div`flex-grow: 1; overflow-y: auto; padding: 2rem;`;
const PlaylistItem = styled.div<{ $isActive: boolean }>`
  display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; border-radius: 8px; cursor: pointer; transition: background-color 0.2s ease;
  background-color: ${({ theme, $isActive }) => $isActive ? theme.ui_bg_hover : 'transparent'};
  &:hover { background-color: ${({ theme }) => theme.ui_bg_hover}; }
`;
const FullScreenOverlay = styled.div`position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: ${({ theme }) => theme.body}; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; z-index: 100; padding: 2rem; text-align: center;`;
const HeaderControls = styled.div`display: flex; align-items: center; gap: 1rem; position: absolute; top: 1.5rem; right: 1.5rem; z-index: 10;`;
const StyledHeader = styled.header`padding: 1.5rem 2rem; background: ${({ theme }) => theme.ui_bg}; border-bottom: 1px solid ${({ theme }) => theme.ui_bg_hover};`;

// --- SVG Icons ---
const PlayIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>);
const PauseIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>);
const SkipNextIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"></path></svg>);
const SkipPreviousIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"></path></svg>);
const SunIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>);
const MoonIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>);
const MusicIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>);
const DownloadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>);

// ====================================================================
// --- COMPONENTES LÓGICOS ---
// ====================================================================

const Player: React.FC<{
    track: Track | null; isPlaying: boolean; progress: number; duration: number; onPlayPause: () => void; onNext: () => void; onPrev: () => void; onSeek: (e: React.MouseEvent<HTMLDivElement>) => void; currentTime: number;
}> = ({ track, isPlaying, onPlayPause, onNext, onPrev, progress, duration, onSeek, currentTime }) => {
    const formatTime = (time: number) => { if (isNaN(time) || time === 0) return '0:00'; const minutes = Math.floor(time / 60); const seconds = Math.floor(time % 60).toString().padStart(2, '0'); return `${minutes}:${seconds}`; };
    return (
        <PlayerContainer>
            <div style={{minWidth: '200px', display: 'flex', alignItems: 'center', gap: '1rem'}}>{track && <MusicIcon />}<div><Text $weight="600">{track ? track.name.replace(/\.mp3|\.m4a|\.flac/gi, '') : "Nenhuma música"}</Text>{track && <Text size="0.8rem" muted>Música do Drive</Text>}</div></div>
            <PlayerCenter>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem'}}><IconButton onClick={onPrev} disabled={!track}><SkipPreviousIcon /></IconButton><IconButton onClick={onPlayPause} disabled={!track} style={{ width: 60, height: 60, color: 'white', backgroundColor: track ? '#1db954' : '#ccc' }}>{isPlaying ? <PauseIcon /> : <PlayIcon />}</IconButton><IconButton onClick={onNext} disabled={!track}><SkipNextIcon /></IconButton></div>
                <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: '1rem'}}><Text size="0.8rem">{formatTime(currentTime)}</Text><ProgressBarContainer onClick={onSeek}><ProgressFill $progress={progress} /></ProgressBarContainer><Text size="0.8rem">{formatTime(duration)}</Text></div>
            </PlayerCenter>
            <div style={{minWidth: '200px'}}></div>
        </PlayerContainer>
    );
};

const Playlist: React.FC<{
    tracks: Track[]; currentTrack: Track | null; onTrackSelect: (index: number) => void;
}> = ({ tracks, currentTrack, onTrackSelect }) => {
    if (tracks.length === 0) return (<PlaylistContainer style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Text muted>Sua playlist aparecerá aqui.</Text></PlaylistContainer>);
    return (<PlaylistContainer>{tracks.map((track, index) => (<PlaylistItem key={track.id} $isActive={currentTrack?.id === track.id} onClick={() => onTrackSelect(index)}><Text $weight="500">{index + 1}.</Text><Text>{track.name.replace(/\.mp3|\.m4a|\.flac/gi, '')}</Text></PlaylistItem>))}</PlaylistContainer>);
};

const useGoogleAPIs = (onAuthenticated: (token: any) => void) => {
    const [isGapiReady, setGapiReady] = useState(false);
    const [isGisReady, setGisReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        const gapiScript = document.createElement('script'); gapiScript.src = 'https://apis.google.com/js/api.js'; gapiScript.async = true; gapiScript.defer = true; gapiScript.onload = () => window.gapi.load('client:picker', () => setGapiReady(true)); gapiScript.onerror = () => setError("Falha ao carregar a API do Google."); document.body.appendChild(gapiScript);
        const gisScript = document.createElement('script'); gisScript.src = 'https://accounts.google.com/gsi/client'; gisScript.async = true; gisScript.defer = true; gisScript.onload = () => setGisReady(true); gisScript.onerror = () => setError("Falha ao carregar os serviços de identidade do Google."); document.body.appendChild(gisScript);
        return () => { const gapi = document.querySelector('script[src="https://apis.google.com/js/api.js"]'); const gis = document.querySelector('script[src="https://accounts.google.com/gsi/client"]'); if (gapi) document.body.removeChild(gapi); if (gis) document.body.removeChild(gis); }
    }, []);
    useEffect(() => {
        if (isGapiReady && isGisReady) {
            try { window.gapi.client.init({ apiKey: GOOGLE_API_KEY, discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"]}); window.tokenClient = window.google.accounts.oauth2.initTokenClient({ client_id: GOOGLE_CLIENT_ID, scope: SCOPES, callback: onAuthenticated }); }
            catch (e) { setError("Erro ao inicializar clientes de API do Google."); console.error(e); }
        }
    }, [isGapiReady, isGisReady, onAuthenticated]);
    return { ready: isGapiReady && isGisReady, error };
};

function App({ toggleTheme, theme }: { toggleTheme: () => void, theme: string }) {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [apiMessage, setApiMessage] = useState<string>("Carregando APIs do Google...");
    const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    
    // CORREÇÃO E MELHORIA: Usando um Map como cache para as URLs das músicas
    const trackUrlCache = useRef<Map<string, string>>(new Map());

    const handleAuth = (tokenResponse: any) => { if (tokenResponse.access_token) setAccessToken(tokenResponse.access_token); };
    const { ready: apiReady, error: apiError } = useGoogleAPIs(handleAuth);
    
    useEffect(() => { if (apiError) setApiMessage(apiError); else if (apiReady) setApiMessage("APIs prontas. Por favor, conecte-se."); }, [apiReady, apiError]);
    
    const handleLogin = () => { if (apiReady && window.tokenClient) window.tokenClient.requestAccessToken({ prompt: 'consent' }); };
    
    const showPicker = () => {
        if (!accessToken || !apiReady) return;
        const view = new window.google.picker.DocsView().setIncludeFolders(true).setMimeTypes('application/vnd.google-apps.folder').setSelectFolderEnabled(true);
        const picker = new window.google.picker.PickerBuilder().enableFeature(window.google.picker.Feature.NAV_HIDDEN).setAppId(SCOPES).setOAuthToken(accessToken).addView(view).setDeveloperKey(GOOGLE_API_KEY).setCallback(pickerCallback).build();
        picker.setVisible(true);
    };

    const pickerCallback = (data: any) => { if (data.action === window.google.picker.Action.PICKED && data.docs?.[0]) fetchSongsFromFolder(data.docs[0].id); };

    const fetchSongsFromFolder = async (folderId: string) => {
        setIsLoading(true); setTracks([]);
        try {
            const response = await window.gapi.client.drive.files.list({ q: `'${folderId}' in parents and (mimeType='audio/mpeg' or mimeType='audio/mp4' or mimeType='audio/flac')`, fields: 'files(id, name, webContentLink)', pageSize: 100 });
            const files = response.result.files as Track[] | undefined;
            if (files && files.length > 0) setTracks(files); else alert("Nenhuma música encontrada na pasta selecionada.");
        } catch (error: any) {
            console.error("Erro ao buscar músicas:", error);
            if (error?.result?.error?.code === 401) { alert("Sua sessão expirou."); setAccessToken(null); } else alert("Não foi possível buscar as músicas.");
        }
        setIsLoading(false);
    };
    
    const currentTrack = currentTrackIndex !== null ? tracks[currentTrackIndex] : null;

    useEffect(() => {
        if (!currentTrack || !accessToken || !audioRef.current) return;
        
        const audio = audioRef.current;
        let isActive = true;

        const loadAndPlayAudio = async () => {
            setIsLoading(true);
            try {
                // Verifica se a música já está no cache
                let blobUrl = trackUrlCache.current.get(currentTrack.id);
                
                // Se não estiver, baixa e adiciona ao cache
                if (!blobUrl) {
                    const url = `https://www.googleapis.com/drive/v3/files/${currentTrack.id}?alt=media`;
                    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });
                    if (!response.ok) throw new Error(`Falha ao buscar áudio: ${response.statusText}`);
                    const blob = await response.blob();
                    blobUrl = URL.createObjectURL(blob);
                    trackUrlCache.current.set(currentTrack.id, blobUrl);
                }

                if (isActive) {
                    audio.src = blobUrl;
                    if (isPlaying) {
                        await audio.play();
                    }
                }
            } catch (error) {
                console.error("Erro ao carregar e tocar música:", error);
            } finally {
                if (isActive) setIsLoading(false);
            }
        };

        loadAndPlayAudio();

        return () => { isActive = false; }
    }, [currentTrack, accessToken]);

    // Efeito separado para controlar play/pause
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying && audio.src && audio.paused) {
            audio.play().catch(e => console.error("Erro ao dar play:", e));
        } else if (!isPlaying && !audio.paused) {
            audio.pause();
        }
    }, [isPlaying]);
    
    const handlePlayPause = () => { if (currentTrackIndex === null && tracks.length > 0) { setCurrentTrackIndex(0); } setIsPlaying(!isPlaying); };
    const handleTrackSelect = (index: number) => { if (index === currentTrackIndex) { setIsPlaying(!isPlaying); } else { setCurrentTrackIndex(index); setIsPlaying(true); } };
    const handleNext = () => { if (currentTrackIndex !== null) { setCurrentTrackIndex(prev => (prev! + 1) % tracks.length); setIsPlaying(true); } };
    const handlePrev = () => { if (currentTrackIndex !== null) { setCurrentTrackIndex(prev => (prev! - 1 + tracks.length) % tracks.length); setIsPlaying(true); } };
    const onTimeUpdate = () => { const audio = audioRef.current; if (audio?.duration) { setProgress((audio.currentTime / audio.duration) * 100); setCurrentTime(audio.currentTime); } };
    const onLoadedMetadata = () => { if (audioRef.current) setDuration(audioRef.current.duration); };
    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => { const audio = audioRef.current; if (audio?.duration) audio.currentTime = (e.clientX - e.currentTarget.getBoundingClientRect().left) / e.currentTarget.offsetWidth * audio.duration; };
    
    useEffect(() => {
        // CORREÇÃO PWA: Registra o Service Worker a partir do arquivo físico em /public/sw.js
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(registration => {
                    console.log('SW registrado: ', registration);
                }).catch(registrationError => {
                    console.log('Falha no registro do SW: ', registrationError);
                });
            });
        }

        const handleInstallPrompt = (e: Event) => { e.preventDefault(); setInstallPromptEvent(e); };
        window.addEventListener('beforeinstallprompt', handleInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    }, []);

    const handleInstallClick = () => { if (installPromptEvent) { installPromptEvent.prompt(); installPromptEvent.userChoice.then(() => setInstallPromptEvent(null)); } };

    if (!accessToken) {
        return (
            <FullScreenOverlay>
                <HeaderControls>
                    {installPromptEvent && <IconButton onClick={handleInstallClick} title="Instalar App"><DownloadIcon /></IconButton>}
                    <IconButton onClick={toggleTheme}>{theme === 'light' ? <MoonIcon /> : <SunIcon />}</IconButton>
                </HeaderControls>
                <Text size="2rem" $weight="700">Bem-vindo ao MiniSpotify</Text>
                <Text muted>Conecte-se com sua conta Google para ouvir suas músicas do Drive.</Text>
                <Button onClick={handleLogin} disabled={!apiReady}>{apiReady ? 'Conectar com Google Drive' : 'Carregando...'}</Button>
                <Text size="0.8rem" muted>{apiMessage}</Text>
                {apiError && <Text size="0.9rem" style={{color: '#ef4444'}}>Por favor, verifique se você substituiu a API Key e o Client ID.</Text>}
            </FullScreenOverlay>
        );
    }
    
    return (
        <AppContainer>
             <HeaderControls>
                {installPromptEvent && <IconButton onClick={handleInstallClick} title="Instalar App"><DownloadIcon /></IconButton>}
                <IconButton onClick={toggleTheme}>{theme === 'light' ? <MoonIcon /> : <SunIcon />}</IconButton>
            </HeaderControls>
            <audio ref={audioRef} onTimeUpdate={onTimeUpdate} onLoadedMetadata={onLoadedMetadata} onEnded={handleNext} />
            <StyledHeader><Button onClick={showPicker}>Selecionar outra pasta de músicas</Button></StyledHeader>
            {isLoading ? (
                <div style={{flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem'}}>
                    <Spinner /><Text muted>Carregando...</Text>
                </div>
            ) : (<Playlist tracks={tracks} currentTrack={currentTrack} onTrackSelect={handleTrackSelect} />)}
            <Player track={currentTrack} isPlaying={isPlaying} onPlayPause={handlePlayPause} onNext={handleNext} onPrev={handlePrev} progress={progress} duration={duration} onSeek={handleSeek} currentTime={currentTime}/>
        </AppContainer>
    );
}

function AppWrapper() {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
    const toggleTheme = () => { const newTheme = theme === 'light' ? 'dark' : 'light'; setTheme(newTheme); localStorage.setItem('theme', newTheme); };
    const selectedTheme = theme === 'light' ? lightTheme : darkTheme;
    return (<ThemeProvider theme={selectedTheme}><GlobalStyle /><App toggleTheme={toggleTheme} theme={theme} /></ThemeProvider>);
}

export default AppWrapper;