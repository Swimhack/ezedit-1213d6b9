
import { useState, useEffect } from 'react';
import { useLocalStorage } from './use-local-storage';

export function useTheme() {
  // Default to system preference, then fall back to 'light'
  const [theme, setTheme] = useLocalStorage('theme', 'system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove dark mode class if present
    root.classList.remove('dark');
    
    // Determine actual theme based on preference
    if (theme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setResolvedTheme(systemPrefersDark ? 'dark' : 'light');
      
      if (systemPrefersDark) {
        root.classList.add('dark');
      }
    } else {
      setResolvedTheme(theme as 'light' | 'dark');
      
      // Only add dark class if explicitly set to dark
      if (theme === 'dark') {
        root.classList.add('dark');
      }
    }
    
    // Set a data attribute for components that might use it
    root.setAttribute('data-theme', resolvedTheme);
  }, [theme, resolvedTheme]);

  return {
    theme,
    resolvedTheme,
    setTheme: (theme: 'light' | 'dark' | 'system') => setTheme(theme),
    toggleTheme: () => setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'),
    // Add convenience properties
    isLight: resolvedTheme === 'light',
    isDark: resolvedTheme === 'dark'
  };
}
