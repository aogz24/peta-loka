import Accordion from '../../components/Accordion';

const items = [
  {
    id: 'what',
    title: 'Apa itu PetaLoka UMKM?',
    content: 'PetaLoka adalah platform pemetaan dan analisis UMKM dengan fitur clustering dan AI insight yang menggabungkan data dari OpenStreetMap, Supabase, dan Kolosal AI untuk membantu analisis lokasi dan rekomendasi strategis.',
  },
  {
    id: 'data-sources',
    title: 'Sumber data apa saja yang digunakan?',
    content: 'Data berasal dari Supabase (tabel `umkm`, `wisata`, `pelatihan`) dan peta menggunakan data OpenStreetMap. AI insight dihasilkan menggunakan Kolosal AI.',
  },
  {
    id: 'data',
    title: 'Kenapa data UMKM hanya tersedia di area sekitar Bandung?',
    content: 'Saat ini, data UMKM yang tersedia di Supabase hanya mencakup area sekitar Bandung yang dikumpulkan melalui scraping. Kami berencana untuk memperluas cakupan data di masa mendatang.',
  },
  {
    id: 'clustering',
    title: 'Apa itu sistem clustering di PetaLoka?',
    content: 'PetaLoka menggunakan K-Means untuk mengelompokkan titik UMKM berdasarkan koordinat. Output mencakup centroid, assignment, dan statistik cluster untuk analisis lebih lanjut.',
  },
  {
    id: 'ai-insight',
    title: 'Bagaimana AI Agent bekerja?',
    content:
      'AI Agent mengambil hasil clustering sebagai input lalu mengirim prompt terstruktur ke Kolosal AI untuk menghasilkan insight, rekomendasi, dan analisis potensi area. Anda dapat memilih type analisis dan mendapatkan ringkasan strategi.',
  },
];

export default function Page() {
  return (
    <main className="max-w-4xl mx-auto py-12 px-4 bg-white dark:bg-black">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">FAQ — Pertanyaan Umum</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">Jawaban singkat untuk pertanyaan umum tentang PetaLoka.</p>
      </header>

      <section>
        <Accordion items={items} />
      </section>
    </main>
  );
}
