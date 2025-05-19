
import { useState, useEffect } from "react";

export function useTheme() {
  const [isLight, setIsLight] = useState<boolean>(true);
  
  useEffect(() => {
    // Check initial theme preference
    const isDarkMode = document.documentElement.classList.contains('dark') || 
                       window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsLight(!isDarkMode);
    
    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          setIsLight(!isDark);
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);
  
  return { isLight };
}
