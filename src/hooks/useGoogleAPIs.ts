import { useEffect, useState } from 'react';

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

export const useGoogleAPIs = (onAuthenticated: (token: any) => void) => {
    const [isGapiReady, setGapiReady] = useState(false);
    const [isGisReady, setGisReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const gapiScript = document.createElement('script');
        gapiScript.src = 'https://apis.google.com/js/api.js';
        gapiScript.async = true; gapiScript.defer = true;
        gapiScript.onload = () => window.gapi.load('client:picker', () => setGapiReady(true));
        gapiScript.onerror = () => setError("Falha ao carregar a API do Google.");
        document.body.appendChild(gapiScript);

        const gisScript = document.createElement('script');
        gisScript.src = 'https://accounts.google.com/gsi/client';
        gisScript.async = true; gisScript.defer = true;
        gisScript.onload = () => setGisReady(true);
        gisScript.onerror = () => setError("Falha ao carregar os serviços de identidade do Google.");
        document.body.appendChild(gisScript);

        return () => {
            const gapi = document.querySelector('script[src="https://apis.google.com/js/api.js"]');
            const gis = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
            if (gapi) document.body.removeChild(gapi);
            if (gis) document.body.removeChild(gis);
        }
    }, []);

    useEffect(() => {
        if (isGapiReady && isGisReady) {
            try {
                window.gapi.client.init({ apiKey: GOOGLE_API_KEY, discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"] });
                window.tokenClient = window.google.accounts.oauth2.initTokenClient({ client_id: GOOGLE_CLIENT_ID, scope: SCOPES, callback: onAuthenticated });
            } catch (e) {
                setError("Erro ao inicializar clientes de API do Google.");
                console.error(e);
            }
        }
    }, [isGapiReady, isGisReady, onAuthenticated]);

    return { ready: isGapiReady && isGisReady, error };
};