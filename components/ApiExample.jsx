'use client';

import { useState } from 'react';

export default function ApiExample() {
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState(null);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/places');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setPlaces(json.data || []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
      <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Contoh API GET</h3>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Klik tombol untuk memanggil endpoint `/api/places` dan melihat respons JSON.</p>

      <div className="mt-4 flex items-center gap-4">
        <button onClick={load} disabled={loading} className="rounded bg-black px-3 py-2 text-white hover:opacity-90 dark:bg-white dark:text-black">
          {loading ? 'Memuat...' : 'Muat Places'}
        </button>
        {error && <div className="text-sm text-red-500">Error: {error}</div>}
      </div>

      {places && (
        <ul className="mt-4 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
          {places.map((p) => (
            <li key={p.id} className="border rounded px-3 py-2 bg-zinc-50 dark:bg-zinc-900">
              <div className="font-medium">{p.name}</div>
              <div className="text-xs">
                lat: {p.lat}, lng: {p.lng}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
