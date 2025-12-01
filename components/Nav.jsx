'use client';

import Link from 'next/link';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full border-b bg-white dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-lg font-semibold">PetaLoka</div>
          </div>

          <nav className="hidden sm:flex sm:items-center sm:gap-6">
            <Link href="/" className="text-sm hover:underline">
              Beranda
            </Link>
            <Link href="/about" className="text-sm hover:underline">
              Tentang
            </Link>
            <Link href="/contact" className="text-sm hover:underline">
              Kontak
            </Link>
            <ThemeToggle />
          </nav>

          <div className="flex items-center sm:hidden">
            <ThemeToggle />
            <button aria-label="Toggle menu" onClick={() => setOpen((v) => !v)} className="ml-2 inline-flex items-center justify-center rounded-md p-2 text-sm">
              {open ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="sm:hidden border-t">
          <div className="px-4 pt-3 pb-4">
            <Link href="/" className="block py-2">
              Beranda
            </Link>
            <Link href="/about" className="block py-2">
              Tentang
            </Link>
            <Link href="/contact" className="block py-2">
              Kontak
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
