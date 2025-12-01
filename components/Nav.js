'use client';

import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function Nav() {
  return (
    <header className="w-full border-b bg-white dark:bg-gray-900 dark:border-gray-700 py-4 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">🗺️ PetaLoka UMKM</h1>
            <p className="text-sm text-gray-600 dark:text-gray:400 mt-1">Platform Pemetaan & Analisis UMKM dengan AI</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-800 dark:text-gray-200">Data Sources</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">OpenStreetMap + Kolosal AI</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
