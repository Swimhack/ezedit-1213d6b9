
import { useState, useEffect } from 'react';
import { useLocalStorage } from './use-local-storage';

export function useTheme() {
  // Default to 'light' theme
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove dark mode class if present
    root.classList.remove('dark');
    
    // Only add dark class if explicitly set to dark
    if (theme === 'dark') {
      root.classList.add('dark');
    }
    
    // Set a data attribute for components that might use it
    root.setAttribute('data-theme', theme);
  }, [theme]);

  return {
    theme,
    setTheme: (theme: 'light' | 'dark') => setTheme(theme),
    toggleTheme: () => setTheme(theme === 'light' ? 'dark' : 'light'),
    // Add a convenience property
    isLight: theme === 'light'
  };
}
