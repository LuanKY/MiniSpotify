import { useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle } from './styles/GlobalStyle';
import { darkTheme, lightTheme } from './styles/theme';
import { HomePage } from './screens/HomePage';

function App() {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const selectedTheme = theme === 'light' ? lightTheme : darkTheme;

    return (
        <ThemeProvider theme={selectedTheme}>
            <GlobalStyle />
            <HomePage toggleTheme={toggleTheme} themeName={theme} />
        </ThemeProvider>
    );
}

export default App;