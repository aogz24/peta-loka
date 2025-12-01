import Link from 'next/link';

export default function Contact() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Kontak</h1>
      <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-400">Untuk pertanyaan atau kerjasama, silakan isi form berikut (placeholder).</p>

      <form className="mt-6 grid gap-4 rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
        <label className="flex flex-col text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">Nama</span>
          <input className="mt-1 rounded border px-3 py-2 text-sm" placeholder="Nama Anda" />
        </label>

        <label className="flex flex-col text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">Email</span>
          <input className="mt-1 rounded border px-3 py-2 text-sm" placeholder="email@contoh.com" />
        </label>

        <label className="flex flex-col text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">Pesan</span>
          <textarea className="mt-1 rounded border px-3 py-2 text-sm" rows="4" placeholder="Tulis pesan Anda..."></textarea>
        </label>

        <div className="flex items-center justify-between">
          <button type="button" className="rounded bg-black px-4 py-2 text-white hover:opacity-90 dark:bg-white dark:text-black">
            Kirim
          </button>
          <Link href="/" className="text-sm font-medium hover:underline">
            ← Kembali
          </Link>
        </div>
      </form>
    </div>
  );
}
