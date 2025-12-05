"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import Image from "next/image";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="w-full backdrop-blur-md bg-white/70 dark:bg-gray-900 dark:border-gray-700  supports-[backdrop-filter]:bg-white/40  border-b border-white/20 dark:border-white/5 shadow-sm fixed top-0 left-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo.png"
              className="dark:invert-100 dark:saturate-0"
              alt="PetaLoka Logo"
              width={40}
              height={40}
            />
            <div>
              <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                PetaLoka
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 -mt-1">
                Pemetaan & Analisis UMKM
              </p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-6">
            {[
              { href: "/search", label: "Cari Potensi" },
              { href: "/faq", label: "FAQ" },
              { href: "/contact", label: "Kontak" },
            ].map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href + "/")) ||
                pathname === item.href + "/";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative text-sm font-medium px-2 py-1 rounded-md transition-all duration-300 group
  ${
    isActive
      ? "text-blue-600 dark:text-blue-300 bg-blue-500/10 dark:bg-blue-400/10 shadow-sm shadow-blue-500/20"
      : "text-zinc-700 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-300"
  }
`}
                >
                  {item.label}
                  <span
                    className={`absolute left-1/2 -bottom-0.5 h-[2px] bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500 transform
    ${
      isActive
        ? "w-3/4 -translate-x-1/2 opacity-100"
        : "w-0 opacity-0 group-hover:w-1/2 group-hover:opacity-100 group-hover:-translate-x-1/2"
    }
  `}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right side (theme + menu) */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Mobile Toggle */}
            <button
              onClick={() => setOpen((s) => !s)}
              aria-label="Toggle menu"
              className="md:hidden p-2 rounded-lg hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 dark:text-zinc-200 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white/90 dark:bg-zinc-900/90 backdrop-blur-lg border-t border-white/20 dark:border-white/5 animate-fadeIn">
          <div className="px-4 pt-4 pb-6 space-y-4">
            {[
              { href: "/search", label: "Cari Potensi" },
              { href: "/faq", label: "FAQ" },
              { href: "/contact", label: "Kontak" },
            ].map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href + "/")) ||
                pathname === item.href + "/";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block text-base font-medium ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-zinc-800 dark:text-zinc-200"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
