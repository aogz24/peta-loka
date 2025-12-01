'use client';

import { ThemeProvider as NextThemeProvider } from 'next-themes';
import React from 'react';

export default function Providers({ children }) {
  return (
    <NextThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemeProvider>
  );
}
