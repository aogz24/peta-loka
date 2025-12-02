# Setup Supabase - Quick Start

## 1️⃣ Buat Supabase Project

1. Kunjungi [https://app.supabase.com/](https://app.supabase.com/)
2. Login atau daftar akun baru
3. Klik "New Project"
4. Isi detail project:
   - **Name**: peta-loka (atau nama lain)
   - **Database Password**: Buat password yang kuat
   - **Region**: Pilih yang terdekat (Southeast Asia)
5. Tunggu project dibuat (~2 menit)

## 2️⃣ Dapatkan Credentials

1. Setelah project selesai dibuat, buka **Settings** > **API**
2. Copy dua nilai ini:
   - **Project URL** (contoh: `https://xxxxxxxxxxxx.supabase.co`)
   - **anon public** key (klik "Reveal" untuk melihat)

## 3️⃣ Setup Environment Variables

1. Buka file `.env.local` di root folder project
2. Paste credentials Anda:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 4️⃣ Buat Database Tables

1. Di Supabase Dashboard, buka **SQL Editor**
2. Klik **New Query**
3. Copy seluruh isi file `lib/supabase/schema.sql`
4. Paste ke SQL Editor
5. Klik **Run** (atau tekan F5)
6. Tunggu hingga muncul pesan "Success"

## 5️⃣ Migrasi Data

Jalankan script migrasi untuk upload data JSON ke Supabase:

```bash
npm run migrate
```

Atau jika ingin lebih control:

```bash
# Migrasi semua data
node scripts/migrate-to-supabase.js

# Migrasi satu tabel saja
node scripts/migrate-to-supabase.js --table=pelatihan
node scripts/migrate-to-supabase.js --table=umkm
node scripts/migrate-to-supabase.js --table=wisata
```

## 6️⃣ Verifikasi

### Cek di Supabase Dashboard

1. Buka **Table Editor**
2. Pilih tabel: `pelatihan`, `umkm`, atau `wisata`
3. Pastikan data sudah ter-upload

### Cek di Aplikasi

```bash
npm run dev
```

Buka browser dan pastikan map menampilkan data.

## ✅ Selesai!

Aplikasi Anda sekarang menggunakan Supabase sebagai database! 🎉

## 📚 Referensi Lengkap

Untuk dokumentasi lengkap, lihat [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

## ⚠️ Troubleshooting

**Error: Missing Supabase environment variables**

- Pastikan `.env.local` terisi dengan benar
- Restart development server

**Error: relation "pelatihan" does not exist**

- Jalankan SQL schema di Supabase Dashboard

**Data tidak muncul**

- Cek apakah migrasi berhasil di Supabase Dashboard
- Restart dev server: `npm run dev`
