'use client';

import * as React from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
  systemTheme: 'light' | 'dark';
}

const ThemeContext = React.createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => {},
  resolvedTheme: 'light',
  systemTheme: 'light',
});

export function useTheme() {
  return React.useContext(ThemeContext);
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'theme',
  enableSystem = true,
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}) {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          return saved;
        }
      } catch {}
    }
    return defaultTheme;
  });

  const [systemTheme, setSystemTheme] = React.useState<'light' | 'dark'>('light');

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemTheme = () => {
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    };

    updateSystemTheme();
    mediaQuery.addEventListener('change', updateSystemTheme);
    return () => mediaQuery.removeEventListener('change', updateSystemTheme);
  }, []);

  const resolvedTheme: 'light' | 'dark' =
    theme === 'system' ? (enableSystem ? systemTheme : 'light') : theme;

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [resolvedTheme]);

  const setTheme = React.useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch {}
    },
    [storageKey]
  );

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        resolvedTheme,
        systemTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
