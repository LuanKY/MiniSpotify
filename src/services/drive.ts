export interface Track {
    id: string;
    name: string;
    webContentLink: string;
}

export const fetchSongsFromFolder = async (folderId: string): Promise<Track[]> => {
    let allFiles: Track[] = [];
    let pageToken: string | undefined = undefined;

    try {
        do {
            const response = await window.gapi.client.drive.files.list({
                q: `'${folderId}' in parents and (mimeType='audio/mpeg' or mimeType='audio/mp4' or mimeType='audio/flac')`,
                fields: 'files(id, name, webContentLink), nextPageToken',
                pageSize: 1000,
                pageToken: pageToken,
            });

            const files = response.result.files as Track[] | undefined;
            if (files) {
                allFiles = allFiles.concat(files);
            }

            pageToken = response.result.nextPageToken;
        } while (pageToken);

        allFiles.sort((a, b) =>
            new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare(a.name, b.name)
        );

        return allFiles;

    } catch (error) {
        console.error("Erro ao buscar músicas do Drive:", error);
        throw error;
    }
};

export const fetchAudioBlobUrl = async (trackId: string, accessToken: string): Promise<string> => {
    const url = `https://www.googleapis.com/drive/v3/files/${trackId}?alt=media`;
    const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (!response.ok) {
        throw new Error(`Falha ao buscar áudio: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
};