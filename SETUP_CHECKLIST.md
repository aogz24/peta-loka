# ✅ Setup Checklist

Ikuti checklist ini untuk setup Supabase dan migrasi data.

## 📋 Pre-requisites

- [x] Node.js installed
- [x] npm packages installed (`npm install` sudah dijalankan)
- [ ] Akun Supabase (gratis di https://app.supabase.com/)

## 🚀 Setup Steps

### 1. Create Supabase Project

- [ ] Login ke https://app.supabase.com/
- [ ] Klik "New Project"
- [ ] Isi nama project: `peta-loka`
- [ ] Set password database (simpan dengan aman!)
- [ ] Pilih region: Southeast Asia (Singapore)
- [ ] Tunggu ~2 menit hingga project ready

### 2. Get Credentials

- [ ] Buka Settings > API
- [ ] Copy **Project URL**
- [ ] Copy **anon public** key (klik "Reveal")

### 3. Setup Environment

- [ ] Buka file `.env.local`
- [ ] Paste Project URL di `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Paste Anon Key di `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Isi juga `KOLOSAL_API_KEY` jika belum

File `.env.local` harus terlihat seperti ini:

```env
KOLOSAL_API_KEY=your_kolosal_api_key

NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

NEXT_PUBLIC_MAP_CENTER_LAT=-6.9170662
NEXT_PUBLIC_MAP_CENTER_LNG=107.5923976
NEXT_PUBLIC_MAP_ZOOM=12
```

### 4. Create Database Tables

- [ ] Buka Supabase Dashboard
- [ ] Klik "SQL Editor" di sidebar
- [ ] Klik "New Query"
- [ ] Buka file `lib/supabase/schema.sql` di code editor
- [ ] Copy SEMUA isinya
- [ ] Paste ke SQL Editor di Supabase
- [ ] Klik "Run" (atau tekan F5)
- [ ] Tunggu hingga muncul "Success. No rows returned"

### 5. Migrate Data

Jalankan migration script:

```bash
npm run migrate
```

**Expected output:**

```
🚀 Starting migration to Supabase...
   Batch size: 1000

📂 Processing pelatihan...
   📄 Loaded 18557 records from JSON

📤 Uploading 18557 records to pelatihan...
✅ Progress: 100.0% (18557/18557)

📊 Upload Summary for pelatihan:
   ✅ Success: 18557
   ❌ Errors: 0
   📈 Total: 18557

[... similar for umkm and wisata ...]

✨ Migration completed!
```

- [ ] Migrasi selesai tanpa error
- [ ] Total records: ~117,841

### 6. Verify Migration

#### Di Supabase Dashboard:

- [ ] Buka "Table Editor"
- [ ] Check table `pelatihan` (~18,557 records)
- [ ] Check table `umkm` (~46,443 records)
- [ ] Check table `wisata` (~52,841 records)

#### Di Aplikasi:

```bash
npm run dev
```

- [ ] Buka http://localhost:3000
- [ ] Map menampilkan markers
- [ ] Data UMKM, Wisata, Pelatihan muncul
- [ ] Clustering berfungsi dengan baik

### 7. Test API Endpoints

Test dengan browser atau curl:

- [ ] http://localhost:3000/api/pelatihan
- [ ] http://localhost:3000/api/umkm
- [ ] http://localhost:3000/api/wisata
- [ ] http://localhost:3000/api/clustering?clusters=5

## ✅ All Done!

Jika semua checklist sudah ✅, aplikasi Anda sudah menggunakan Supabase! 🎉

## 🆘 Troubleshooting

| Problem                          | Solution                                            |
| -------------------------------- | --------------------------------------------------- |
| Error: Missing Supabase env vars | Check `.env.local` sudah diisi dengan benar         |
| Table not found                  | Run SQL schema di Supabase Dashboard                |
| Migration failed                 | Check internet connection, try smaller batch size   |
| No data in app                   | Verify migration success in Supabase Dashboard      |
| API errors                       | Check browser console & terminal for error messages |

## 📚 Documentation

- Quick Start: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- Complete Guide: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- Summary: [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)

---

**Need help?** Check the documentation files above or Supabase docs at https://supabase.com/docs
