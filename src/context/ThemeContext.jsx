import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getTheme, getModeColors } from '../theme';

export const ThemeModeContext = createContext({
  mode: 'dark',
  toggleMode: () => {},
  modeColors: getModeColors('dark'),
});

export const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('themeMode');
    return saved || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const theme = useMemo(() => getTheme(mode), [mode]);
  const modeColors = useMemo(() => getModeColors(mode), [mode]);

  const value = useMemo(
    () => ({ mode, toggleMode, modeColors }),
    [mode, toggleMode, modeColors]
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => {
  const context = React.useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeModeProvider');
  }
  return context;
};
