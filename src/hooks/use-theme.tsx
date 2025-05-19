
import { useState, useEffect } from 'react';
import { useLocalStorage } from './use-local-storage';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  // Default to system preference, then fall back to 'light'
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [isLight, setIsLight] = useState<boolean>(true);

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
  const updateTheme = (currentTheme: Theme) => {
    const root = window.document.documentElement;
    
    // Remove both classes first
    root.classList.remove('light', 'dark');
    
    // Determine actual theme based on preference
    if (currentTheme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const newTheme = systemPrefersDark ? 'dark' : 'light';
      setResolvedTheme(newTheme);
      setIsLight(newTheme === 'light');
      
      // Add the appropriate class
      root.classList.add(newTheme);
      root.setAttribute('data-theme', newTheme); // Set attribute consistently
    } else {
      const newTheme = currentTheme as 'light' | 'dark';
      setResolvedTheme(newTheme);
      setIsLight(newTheme === 'light');
      
      // Add the theme class
      root.classList.add(newTheme);
      root.setAttribute('data-theme', newTheme); // Set attribute consistently
    }
  };

  return {
    theme,
    resolvedTheme,
    setTheme: (theme: Theme) => setTheme(theme),
    toggleTheme: () => setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'),
    // Add convenience properties
    isLight,
    isDark: !isLight
  };
}
