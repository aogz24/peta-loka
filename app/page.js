'use client';

import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Dynamic import untuk MapComponent (client-side only)
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  ),
});

export default function Home() {
  const intro = {
    title: 'PetaLoka — Temukan Potensi UMKM di Sekitar Anda',
    subtitle: 'Platform peta dan analisis UMKM untuk menemukan klaster potensi ekonomi mikro di wilayah lokal.',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-black flex items-center">
      <div className="max-w-6xl mx-auto px-6 py-24 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-zinc-50 leading-tight">{intro.title}</h1>
            <p className="mt-4 text-zinc-600 dark:text-zinc-300 text-lg">{intro.subtitle}</p>

            <div className="mt-8 flex gap-4">
              <a href="/search" className="glass-btn inline-block px-6 py-3 rounded-md text-white bg-blue-600 hover:bg-blue-700">
                Cari Potensi Peta Baru
              </a>
              <a href="/faq" className="inline-block px-6 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-700 dark:text-zinc-200">
                Pelajari Lebih Lanjut
              </a>
            </div>
          </div>

          <div className="glass-card">
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Ikhtisar</h3>
            <p className="mt-2 text-zinc-600 dark:text-zinc-300">Gunakan peta untuk memindai area, lihat klaster UMKM, dan dapatkan rekomendasi intervensi atau peluang usaha.</p>

            <div className="mt-6 h-64 bg-gradient-to-br from-gray-100 to-white dark:from-zinc-800 dark:to-zinc-900 rounded-lg flex items-center justify-center">
              <Image src="/preview peta.png" alt="preview peta" width={1600} height={900} quality={100} className="w-full h-full object-cover rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
