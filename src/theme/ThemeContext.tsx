/**
 * Laya (లయ) Mobile — Theme Provider & Hook
 * Dynamic Dark & Light Theme State with AsyncStorage Persistence
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors, ColorPalette } from './tokens';

export type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  theme: ThemeMode;
  colors: ColorPalette;
  isDark: boolean;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = '@laya:theme_mode';

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  colors: darkColors,
  isDark: true,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>('dark');

  useEffect(() => {
    async function loadTheme() {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') {
          setTheme(saved);
        }
      } catch {
        // Fallback to dark
      }
    }
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const next: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Non-fatal
    }
  };

  const isDark = theme === 'dark';
  const activeColors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, colors: activeColors, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextType {
  return useContext(ThemeContext);
}
