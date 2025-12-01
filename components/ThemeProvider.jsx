'use client';

import { ThemeContext } from '@/context/ThemeContext';
import React, { useContext, useEffect, useState } from 'react';

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'system';

    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved; // ← no need setState
      }
    } catch {}

    return 'system';
  });

  // Apply the theme normally
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;

    const applyTheme = (mode) => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const finalTheme = mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;

      if (finalTheme === 'dark') root.classList.add('dark');
      else root.classList.remove('dark');
    };

    applyTheme(theme);

    // persist
    try {
      if (theme === 'system') localStorage.removeItem('theme');
      else localStorage.setItem('theme', theme);
    } catch {}

    // system listener
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handle = () => theme === 'system' && applyTheme('system');

    mq.addEventListener('change', handle);
    return () => mq.removeEventListener('change', handle);
  }, [theme]);

  const toggle = () => {
    setTheme((prev) => {
      if (prev === 'system') return 'dark';
      if (prev === 'dark') return 'light';
      return 'dark';
    });
  };

  return <ThemeContext.Provider value={{ theme, setTheme, toggle }}>{children}</ThemeContext.Provider>;
}
