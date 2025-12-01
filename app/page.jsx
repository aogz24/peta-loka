import Image from 'next/image';
import ApiExample from '../components/ApiExample';

export default function Home() {
  return (
    <div className="bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <section className="mb-12">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">Selamat datang di PetaLoka</h1>
          <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-400">Contoh struktur halaman dengan navigasi dan footer yang dipisah sebagai komponen.</p>
        </section>

        <section className="grid gap-6 sm:grid-cols-2">
          <article className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <h2 className="text-xl font-semibold">Mulai</h2>
            <p className="mt-2 text-zinc-600">Edit `app/page.js` untuk memodifikasi konten ini.</p>
          </article>

          <article className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <h2 className="text-xl font-semibold">Sumber</h2>
            <p className="mt-2 text-zinc-600">Tambahkan halaman seperti `/about` atau `/contact` untuk demo navigasi.</p>
          </article>
        </section>

        <ApiExample />
      </main>
    </div>
  );
}
