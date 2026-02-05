'use client';

import { useState, useEffect, useCallback } from 'react';
import useLocalStorage from './useLocalStorage';

type Theme = 'light' | 'dark' | 'system';

interface UseThemeReturn {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

function useTheme(): UseThemeReturn {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [isMounted, setIsMounted] = useState(false);

  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  const updateTheme = useCallback(() => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Determine which theme to apply
    const themeToApply = theme === 'system' ? getSystemTheme() : theme;
    
    // Apply the theme
    root.classList.add(themeToApply);
    setResolvedTheme(themeToApply);
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content', 
        themeToApply === 'dark' ? '#1f2937' : '#ffffff'
      );
    }
  }, [theme, getSystemTheme]);

  useEffect(() => {
    setIsMounted(true);
    updateTheme();
  }, [updateTheme]);

  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = () => {
        updateTheme();
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, updateTheme]);

  const toggleTheme = useCallback(() => {
    const newTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [theme, setTheme]);

  // Only render theme-dependent UI after mounting
  if (!isMounted) {
    return {
      theme: 'system',
      resolvedTheme: 'light',
      setTheme: () => {},
      toggleTheme: () => {},
      isDark: false,
    };
  }

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isDark: resolvedTheme === 'dark',
  };
}

export default useTheme;