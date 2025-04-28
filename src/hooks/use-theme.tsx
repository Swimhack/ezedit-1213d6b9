
import { useState, useEffect } from 'react';
import { useLocalStorage } from './use-local-storage';

export function useTheme() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return {
    theme,
    setTheme: (theme: 'light' | 'dark') => setTheme(theme),
    toggleTheme: () => setTheme(theme === 'light' ? 'dark' : 'light'),
  };
}
