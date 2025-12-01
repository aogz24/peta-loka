'use client';

import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, setTheme, toggle } = useTheme();

  return (
    <div className="flex items-center gap-3">
      <button
        aria-label="Toggle theme"
        onClick={toggle}
        className="h-8 w-8 rounded-md border bg-white/80 text-sm shadow-sm 
                   dark:bg-black/70 dark:border-white/10 flex items-center justify-center"
      >
        {theme === 'dark' ? '🌙' : '☀️'}
      </button>

      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="hidden sm:inline-block rounded-md border px-2 py-1 text-sm 
                   bg-white/80 dark:bg-black/70"
        aria-label="Theme select"
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}
