import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'aurelia:theme';
const ThemeContext = createContext({ theme: 'light', setTheme: () => {}, toggleTheme: () => {} });

const readStoredTheme = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

/** Light (ivory & cream) is the signature look; dark is a navy & gold night mode. */
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readStoredTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage unavailable (private mode): theme still applies for this visit */
    }
  }, [theme]);

  const setTheme = useCallback((next) => setThemeState(next === 'dark' ? 'dark' : 'light'), []);
  const toggleTheme = useCallback(() => setThemeState((t) => (t === 'dark' ? 'light' : 'dark')), []);
  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);
