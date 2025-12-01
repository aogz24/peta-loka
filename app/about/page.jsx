import Link from 'next/link';

export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Tentang PetaLoka</h1>
      <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-400">PetaLoka adalah contoh aplikasi peta lokal untuk kebutuhan demo. Halaman ini menampilkan informasi singkat tentang tujuan proyek dan teknologi yang digunakan.</p>

      <section className="mt-8 rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
        <h2 className="text-xl font-semibold">Teknologi</h2>
        <ul className="mt-2 list-disc pl-5 text-zinc-600 dark:text-zinc-300">
          <li>Next.js (App Router)</li>
          <li>Tailwind CSS</li>
          <li>React</li>
        </ul>
      </section>

      <div className="mt-8">
        <Link href="/" className="text-sm font-medium hover:underline">
          ← Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}
