# PetaLoka UMKM 🗺️

Platform pemetaan dan analisis UMKM dengan fitur clustering dan AI insight menggunakan data dari OpenStreetMap, Supabase, dan Kolosal AI.

## 🎯 Fitur Utama

### 1. **Database Supabase**

- Data UMKM, wisata mikro, dan tempat pelatihan tersimpan di Supabase
- Query cepat dengan indexing
- Real-time ready
- Scalable dan reliable

### 2. **Sistem Clustering (K-Means)**

- **Produk Lokal Unggulan**: Clustering UMKM berdasarkan lokasi geografis
- **Lokasi Usaha Kecil**: Pemetaan distribusi UMKM per cluster
- **Potensi Wisata Mikro**: Identifikasi area dengan potensi wisata tinggi
- **Pelatihan Terdekat**: Rekomendasi tempat pelatihan untuk setiap cluster UMKM

### 3. **AI Agent dengan Kolosal AI**

- Generate insight dari hasil clustering
- Rekomendasi strategis untuk pengembangan UMKM
- Analisis potensi area
- Chat interaktif untuk pertanyaan custom
- Powered by **Llama 4 Maverick**

### 4. **Visualisasi Interaktif**

- Peta interaktif dengan Leaflet
- Marker berbeda untuk UMKM, wisata, dan pelatihan
- Cluster visualization dengan warna
- Chart dan grafik statistik (Bar Chart, Pie Chart)
- Dashboard analytics lengkap

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase

Ikuti panduan lengkap di [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

**Ringkasan:**

1. Buat project di [Supabase](https://app.supabase.com/)
2. Copy URL dan Anon Key ke `.env.local`
3. Jalankan SQL schema dari `lib/supabase/schema.sql`
4. Migrasi data dengan `npm run migrate`

### 3. Setup Environment Variables

Buat file `.env.local` dan isi dengan:

```env
KOLOSAL_API_KEY=YOUR_API_KEY_HERE

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Map Config
NEXT_PUBLIC_MAP_CENTER_LAT=-6.9170662
NEXT_PUBLIC_MAP_CENTER_LNG=107.5923976
NEXT_PUBLIC_MAP_ZOOM=12
```

### 4. Migrasi Data ke Supabase

```bash
npm run migrate
```

### 5. Jalankan Development Server

```bash
npm run dev
```

Buka browser dan akses `http://localhost:3000`

## 📁 Struktur Project

```
peta-loka/
├── app/
│   ├── api/
│   │   ├── pelatihan/       # API fetch pelatihan dari Supabase
│   │   ├── umkm/            # API fetch UMKM dari Supabase
│   │   ├── wisata/          # API fetch wisata dari Supabase
│   │   ├── clustering/      # API untuk clustering data
│   │   └── ai-agent/        # API untuk AI insight
│   ├── layout.js
│   └── page.js              # Halaman utama
├── components/
│   ├── MapComponent.js      # Komponen peta Leaflet
│   ├── AIAgentPanel.js      # Panel AI Agent
│   └── ClusterStats.js      # Statistik dan chart
├── lib/
│   ├── data/
│   │   ├── pelatihan.json   # Source data untuk migrasi
│   │   ├── umkm.json        # Source data untuk migrasi
│   │   └── wisata.json      # Source data untuk migrasi
│   ├── supabase/
│   │   ├── client.js        # Supabase client
│   │   └── schema.sql       # Database schema
│   └── services/
│       ├── supabase.js      # Supabase service
│       ├── clustering.js    # K-Means clustering
│       └── kolosal-ai.js    # Kolosal AI service
├── scripts/
│   └── migrate-to-supabase.js  # Migration script
├── .env.local                  # Environment variables
├── SUPABASE_SETUP.md          # Setup guide
└── MIGRATION_GUIDE.md         # Migration guide lengkap
```

## 🔧 Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS
- **Database**: Supabase (PostgreSQL)
- **Mapping**: Leaflet, React-Leaflet
- **Charts**: Recharts
- **Clustering**: ml-kmeans
- **AI**: Kolosal AI (Llama 4 Maverick) via OpenAI SDK
- **Icons**: Lucide React

## 📊 Cara Kerja

### 1. **Data dari Supabase**

- Data tersimpan di 3 tabel: `pelatihan`, `umkm`, `wisata`
- API endpoints untuk fetch data dengan filter
- Caching untuk performance optimal
- Real-time updates ready

### 2. **Clustering**

- Input: Data dari Supabase dengan koordinat lat/lon
- Algoritma: K-Means (default 5 clusters)
- Output:
  - Cluster assignment untuk setiap data point
  - Centroid coordinates
  - Cluster analysis (kategori dominan, total items, dll)

### 3. **AI Insight**

- Input: Hasil clustering + context data
- Process: Kirim ke Kolosal AI dengan prompt terstruktur
- Output: Analisis mendalam dan rekomendasi actionable

## 🎨 Fitur UI

- **Tab Navigation**: Map, Statistics, AI Insight
- **Interactive Map**:
  - Blue markers: UMKM
  - Green markers: Wisata
  - Amber markers: Pelatihan
  - Red markers: Cluster centers
- **Statistics Dashboard**:
  - Summary cards
  - Bar chart (UMKM per cluster)
  - Pie chart (Distribusi kategori)
  - Cluster detail table
  - Potensi wisata cards
- **AI Panel**:
  - Multiple analysis types
  - Custom chat
  - Quick actions
  - Real-time insight generation

## 📝 API Endpoints

### GET /api/pelatihan

Fetch data pelatihan dari Supabase

**Query params:**

- `category` (optional): Filter by category
- `limit` (optional): Limit results

### GET /api/umkm

Fetch data UMKM dari Supabase

**Query params:**

- `category` (optional): Filter by category
- `limit` (optional): Limit results

### GET /api/wisata

Fetch data wisata dari Supabase

**Query params:**

- `category` (optional): Filter by category
- `limit` (optional): Limit results

### GET /api/clustering

Lakukan clustering pada data dari Supabase

**Query params:**

- `clusters` (optional): Jumlah cluster (default: 5)

### POST /api/clustering

Clustering dengan custom data

```json
{
  "umkmData": [...],
  "wisataData": [...],
  "pelatihanData": [...],
  "numClusters": 5
}
```

### POST /api/ai-agent

Generate AI insight

```json
{
  "type": "clustering",
  "data": {...}
}
```

## 🌟 Tips Penggunaan

1. **Untuk area padat UMKM**: Filter data dengan limit atau category
2. **Optimal clusters**: 3-7 clusters untuk hasil terbaik
3. **AI Insight**: Tunggu clustering selesai sebelum generate insight
4. **Performance**: Data sudah ter-index untuk query cepat
5. **Scalability**: Supabase mendukung jutaan records

## 📚 Dokumentasi Lengkap

- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Setup Supabase step-by-step
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Panduan migrasi data lengkap

## 🔄 NPM Scripts

```bash
npm run dev      # Jalankan development server
npm run build    # Build untuk production
npm run start    # Jalankan production server
npm run migrate  # Migrasi data ke Supabase
```

## 📄 License

MIT License

---

**Dibuat dengan ❤️ menggunakan Next.js, Supabase, dan Kolosal AI**
