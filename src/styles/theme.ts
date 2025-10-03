export interface Theme {
  body: string; text: string; accent: string; ui_bg: string;
  ui_bg_hover: string; shadow: string; highlight: string;
}

declare module 'styled-components' {
  export interface DefaultTheme extends Theme { }
}

export const lightTheme: Theme = {
  body: '#f1f5f9', text: '#0f172a', accent: '#1db954',
  ui_bg: '#ffffff', ui_bg_hover: '#e2e8f0',
  shadow: '0 4px 12px rgba(0, 0, 0, 0.1)', highlight: '#cbd5e1'
};

export const darkTheme: Theme = {
  body: '#0f172a', text: '#f1f5f9', accent: '#1db954',
  ui_bg: '#1e293b', ui_bg_hover: '#334155',
  shadow: '0 4px 12px rgba(0, 0, 0, 0.4)', highlight: '#475569'
};