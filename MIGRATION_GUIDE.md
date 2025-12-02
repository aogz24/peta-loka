# Migrasi Data ke Supabase

Panduan ini menjelaskan cara memigrasikan data JSON (pelatihan, umkm, wisata) ke Supabase.

## Persiapan

### 1. Setup Supabase Project

1. Buka [Supabase Dashboard](https://app.supabase.com/)
2. Buat project baru atau gunakan project yang sudah ada
3. Salin **Project URL** dan **Anon/Public Key** dari Settings > API

### 2. Setup Environment Variables

1. Buka file `.env.local` di root folder project
2. Isi dengan kredensial Supabase Anda:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Buat Database Tables

1. Buka Supabase Dashboard > SQL Editor
2. Copy-paste isi file `lib/supabase/schema.sql`
3. Klik "Run" untuk membuat tables dan indexes

## Migrasi Data

### Opsi 1: Migrasi Semua Data

Jalankan command berikut untuk migrasi semua data (pelatihan, umkm, wisata):

```bash
node scripts/migrate-to-supabase.js
```

### Opsi 2: Migrasi Data Spesifik

Migrasi hanya satu jenis data:

```bash
# Migrasi hanya pelatihan
node scripts/migrate-to-supabase.js --table=pelatihan

# Migrasi hanya umkm
node scripts/migrate-to-supabase.js --table=umkm

# Migrasi hanya wisata
node scripts/migrate-to-supabase.js --table=wisata
```

### Opsi 3: Mengatur Batch Size

Secara default, data di-upload dalam batch 1000 records. Anda bisa mengubahnya:

```bash
# Upload 500 records per batch
node scripts/migrate-to-supabase.js --batch-size=500

# Kombinasi dengan table spesifik
node scripts/migrate-to-supabase.js --table=umkm --batch-size=100
```

## Verifikasi Migrasi

### 1. Cek di Supabase Dashboard

1. Buka Supabase Dashboard > Table Editor
2. Pilih table (pelatihan/umkm/wisata)
3. Periksa jumlah records

### 2. Test API Endpoints

```bash
# Test dengan curl
curl http://localhost:3000/api/pelatihan
curl http://localhost:3000/api/umkm
curl http://localhost:3000/api/wisata

# Test clustering
curl http://localhost:3000/api/clustering?clusters=5
```

### 3. Test di Browser

Buka aplikasi dan periksa apakah data muncul di map.

## Struktur Database

### Table Schema

Semua table (pelatihan, umkm, wisata) memiliki struktur yang sama:

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key (dari OSM ID) |
| type | TEXT | Tipe data (pelatihan/umkm/wisata) |
| name | TEXT | Nama lokasi |
| category | TEXT | Kategori (school/hotel/restaurant/etc) |
| lat | DOUBLE PRECISION | Latitude |
| lon | DOUBLE PRECISION | Longitude |
| address | TEXT | Alamat |
| phone | TEXT | Nomor telepon |
| website | TEXT | Website |
| opening_hours | TEXT | Jam operasional |
| description | TEXT | Deskripsi |
| tags | JSONB | Tags tambahan dari OSM |
| created_at | TIMESTAMP | Waktu insert |
| updated_at | TIMESTAMP | Waktu update terakhir |

### Indexes

- Index pada `type` untuk filter cepat berdasarkan tipe
- Index pada `category` untuk filter berdasarkan kategori
- Index pada `lat, lon` untuk query berdasarkan lokasi

## API Endpoints

### GET /api/pelatihan

Fetch data pelatihan dari Supabase.

**Query Parameters:**
- `category` (optional): Filter berdasarkan kategori
- `limit` (optional): Batasi jumlah hasil

**Contoh:**
```bash
# Semua data pelatihan
GET /api/pelatihan

# Filter by category
GET /api/pelatihan?category=school

# Limit hasil
GET /api/pelatihan?limit=100

# Kombinasi
GET /api/pelatihan?category=university&limit=50
```

### GET /api/umkm

Fetch data UMKM dari Supabase.

**Query Parameters:**
- `category` (optional): Filter berdasarkan kategori
- `limit` (optional): Batasi jumlah hasil

**Contoh:**
```bash
GET /api/umkm
GET /api/umkm?category=convenience
GET /api/umkm?limit=100
```

### GET /api/wisata

Fetch data wisata dari Supabase.

**Query Parameters:**
- `category` (optional): Filter berdasarkan kategori
- `limit` (optional): Batasi jumlah hasil

**Contoh:**
```bash
GET /api/wisata
GET /api/wisata?category=hotel
GET /api/wisata?limit=100
```

### GET /api/clustering

Melakukan clustering pada semua data dari Supabase.

**Query Parameters:**
- `clusters` (optional): Jumlah cluster (default: 5)

**Contoh:**
```bash
GET /api/clustering
GET /api/clustering?clusters=7
```

### POST /api/clustering

Clustering dengan custom data.

**Request Body:**
```json
{
  "umkmData": [...],
  "wisataData": [...],
  "pelatihanData": [...],
  "numClusters": 5
}
```

## Troubleshooting

### Error: Missing Supabase environment variables

**Solusi:** Pastikan `.env.local` berisi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Error: relation "pelatihan" does not exist

**Solusi:** Jalankan SQL schema di Supabase Dashboard untuk membuat tables.

### Error: Batch upload failed

**Solusi:** 
- Coba kurangi batch size: `--batch-size=100`
- Periksa koneksi internet
- Periksa quota Supabase project

### Data tidak muncul di aplikasi

**Solusi:**
1. Periksa apakah migrasi berhasil di Supabase Dashboard
2. Restart development server: `npm run dev`
3. Clear browser cache
4. Periksa console browser untuk error

## Performance Tips

### 1. Gunakan RLS Policies yang Tepat

Row Level Security sudah di-enable dengan policy read-only. Untuk write access, tambahkan policy khusus.

### 2. Optimize Queries

- Gunakan `limit` untuk membatasi hasil
- Filter berdasarkan `category` atau `type` untuk query lebih cepat
- Manfaatkan indexes yang sudah dibuat

### 3. Caching

Pertimbangkan untuk menambahkan caching layer di API routes untuk mengurangi query ke Supabase.

## Next Steps

Setelah migrasi berhasil:

1. ✅ Hapus import JSON files dari API routes (sudah diganti dengan Supabase)
2. ✅ Test semua fitur aplikasi
3. ✅ Monitor usage di Supabase Dashboard
4. 🔄 Setup incremental updates untuk data baru
5. 🔄 Implementasi real-time features (optional)

## File Structure

```
peta-loka/
├── lib/
│   ├── supabase/
│   │   ├── client.js          # Supabase client instance
│   │   └── schema.sql         # Database schema
│   ├── services/
│   │   ├── supabase.js        # Supabase service functions
│   │   └── clustering.js      # Clustering service
│   └── data/
│       ├── pelatihan.json     # Source data (untuk migrasi)
│       ├── umkm.json          # Source data (untuk migrasi)
│       └── wisata.json        # Source data (untuk migrasi)
├── scripts/
│   └── migrate-to-supabase.js # Migration script
├── app/
│   └── api/
│       ├── clustering/
│       │   └── route.js       # Clustering API (uses Supabase)
│       ├── pelatihan/
│       │   └── route.js       # Pelatihan API
│       ├── umkm/
│       │   └── route.js       # UMKM API
│       └── wisata/
│           └── route.js       # Wisata API
└── .env.local                 # Environment variables
```
