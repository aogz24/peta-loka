'use client';
import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // avoid SSR mismatch: only render theme-dependent UI after mount
  useEffect(() => setMounted(true), []);

  // simple icons (no external assets)
  const Sun = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="M4.93 4.93l1.41 1.41" />
        <path d="M17.66 17.66l1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="M4.93 19.07l1.41-1.41" />
        <path d="M17.66 6.34l1.41-1.41" />
      </g>
    </svg>
  );

  const Moon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  if (!mounted) {
    // render a non-theme-dependent placeholder to avoid hydration mismatch
    return (
      <div className="inline-flex items-center gap-2">
        <button aria-hidden className="inline-flex items-center gap-2 rounded-md border px-2 py-1 text-sm bg-transparent">
          {Sun}
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        aria-label="Toggle theme"
        title="Toggle theme"
        className="inline-flex items-center gap-2 rounded-md border px-2 py-1 text-sm bg-transparent dark:border-gray-600 dark:text-gray-200"
      >
        {theme === 'dark' ? Moon : Sun}
        <span className="hidden sm:inline">{theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'System'}</span>
      </button>
    </div>
  );
}
