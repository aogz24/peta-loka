import ContactForm from '../../components/ContactForm';

export default function Page() {
  return (
    <main className="max-w-5xl mx-auto py-12 px-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Kontak</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">Hubungi tim PetaLoka untuk pertanyaan, kerjasama, atau dukungan.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-card p-6">
          <h2 className="text-lg font-semibold mb-3">Kirim Pesan</h2>
          <ContactForm />
        </div>

        <aside className="glass-card p-6">
          <h3 className="font-semibold mb-2">Informasi Kontak</h3>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            Email:{' '}
            <a className="text-blue-600" href="mailto:ragus8188@gmail.com">
              ragus8188@gmail.com
            </a>
          </p>
          <p className="mt-3 text-sm">Sumber data & docs:</p>
          <ul className="mt-2 text-sm list-disc list-inside text-zinc-700 dark:text-zinc-300">
            <li>Supabase</li>
            <li>OpenStreetMap</li>
            <li>Kolosal AI</li>
          </ul>

          <div className="mt-4">
            <h4 className="font-medium">Alamat</h4>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">Bandung, Indonesia</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
