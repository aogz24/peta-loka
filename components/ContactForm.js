'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setStatus('missing');
      return;
    }
    setStatus('sending');

    // Simulate send — replace with API call if desired
    await new Promise((r) => setTimeout(r, 800));
    setStatus('success');
    setForm({ name: '', email: '', message: '' });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nama</label>
        <input name="name" value={form.name} onChange={handleChange} className="w-full glass-bg px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-700" placeholder="Nama lengkap" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input name="email" value={form.email} onChange={handleChange} type="email" className="w-full glass-bg px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-700" placeholder="email@contoh.com" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Pesan</label>
        <textarea name="message" value={form.message} onChange={handleChange} rows={5} className="w-full glass-bg px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-700" placeholder="Tulis pesan Anda..." />
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" className="glass-btn px-4 py-2 rounded-md" disabled={status === 'sending'}>
          {status === 'sending' ? 'Mengirim...' : 'Kirim Pesan'}
        </button>

        {status === 'success' && <p className="text-sm text-green-600">Pesan terkirim. Terima kasih!</p>}
        {status === 'missing' && <p className="text-sm text-red-600">Lengkapi semua field terlebih dahulu.</p>}
      </div>
    </form>
  );
}
