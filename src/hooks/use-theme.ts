
import { useState, useEffect } from "react";

export function useTheme() {
  const [isLight, setIsLight] = useState<boolean>(true);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  
  useEffect(() => {
    // Check initial theme preference
    const isDarkMode = document.documentElement.classList.contains('dark') || 
                       window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsLight(!isDarkMode);
    
    // Set initial theme based on document class or system preference
    if (document.documentElement.classList.contains('dark')) {
      setTheme('dark');
      setResolvedTheme('dark');
    } else if (document.documentElement.classList.contains('light')) {
      setTheme('light');
      setResolvedTheme('light');
    } else {
      setTheme('system');
      setResolvedTheme(isDarkMode ? 'dark' : 'light');
    }
    
    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          setIsLight(!isDark);
          setResolvedTheme(isDark ? 'dark' : 'light');
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);
  
  const updateTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    
    // Apply theme to document
    if (newTheme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(systemPrefersDark ? 'dark' : 'light');
      setResolvedTheme(systemPrefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(newTheme);
      setResolvedTheme(newTheme);
    }
  };
  
  return { 
    isLight, 
    theme, 
    setTheme: updateTheme,
    resolvedTheme 
  };
}
