interface Gapi {
    client: {
        init: (config: object) => Promise<void>;
        drive: { files: { list: (params: object) => Promise<any>; }; };
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
export { };
