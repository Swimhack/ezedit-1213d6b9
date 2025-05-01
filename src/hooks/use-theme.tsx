
import { useState, useEffect } from 'react';
import { useLocalStorage } from './use-local-storage';

export function useTheme() {
  // Default to system preference, then fall back to 'light'
  const [theme, setTheme] = useLocalStorage('theme', 'system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Watch for color scheme preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        updateTheme('system');
      }
    };
    
    // Add listener
    mediaQuery.addEventListener('change', handleChange);
    
    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);

  useEffect(() => {
    updateTheme(theme);
  }, [theme]);

  // Function to update the theme in DOM
  const updateTheme = (currentTheme: string) => {
    const root = window.document.documentElement;
    
    // Remove both classes first
    root.classList.remove('light', 'dark');
    
    // Determine actual theme based on preference
    if (currentTheme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setResolvedTheme(systemPrefersDark ? 'dark' : 'light');
      
      // Add the appropriate class
      root.classList.add(systemPrefersDark ? 'dark' : 'light');
    } else {
      const newTheme = currentTheme as 'light' | 'dark';
      setResolvedTheme(newTheme);
      
      // Add the theme class
      root.classList.add(newTheme);
    }
    
    // Set a data attribute for components that might use it
    root.setAttribute('data-theme', resolvedTheme);
  };

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
