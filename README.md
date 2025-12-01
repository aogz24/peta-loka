# PetaLoka UMKM 🗺️

Platform pemetaan dan analisis UMKM dengan fitur clustering dan AI insight menggunakan data dari OpenStreetMap dan Kolosal AI.

## 🎯 Fitur Utama

### 1. **Data Dummy untuk Development**

- Generate otomatis data UMKM, wisata mikro, dan tempat pelatihan
- Area pencarian dengan radius yang dapat disesuaikan
- Data realistis dengan nama, kategori, dan lokasi yang variatif
- _(Ready untuk integrasi OpenStreetMap di production)_

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

## 🚀 Cara Menggunakan

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Buat file `.env.local` dan isi dengan:

```env
KOLOSAL_API_KEY=YOUR_API_KEY_HERE
NEXT_PUBLIC_MAP_CENTER_LAT=-6.2088
NEXT_PUBLIC_MAP_CENTER_LNG=106.8456
NEXT_PUBLIC_MAP_ZOOM=12
```

**PENTING**: Ganti `YOUR_API_KEY_HERE` dengan API key Kolosal AI Anda.

### 3. Jalankan Development Server

```bash
npm run dev
```

Buka browser dan akses `http://localhost:3000`

## 📁 Struktur Project

```
peta-loka/
├── app/
│   ├── api/
│   │   ├── scrape/          # API untuk scraping OpenStreetMap
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
│   │   └── dummy-data.js        # Generator data dummy
│   └── services/
│       ├── openstreetmap.js     # Service scraping OSM (optional)
│       ├── clustering.js        # Service K-Means clustering
│       └── kolosal-ai.js        # Service Kolosal AI
└── .env.local                   # Environment variables
```

## 🔧 Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS
- **Mapping**: Leaflet, React-Leaflet
- **Charts**: Recharts
- **Clustering**: ml-kmeans
- **AI**: Kolosal AI (Llama 4 Maverick) via OpenAI SDK
- **Data**: Dummy Data Generator (ready untuk OSM integration)
- **Icons**: Lucide React

## 📊 Cara Kerja

### 1. **Data Generation (Sementara Dummy)**

- User input koordinat dan radius
- System generate data dummy UMKM, wisata, dan pelatihan
- Data tersebar random dalam radius yang ditentukan
- Return structured data dengan kategori variatif

### 2. **Clustering**

- Input: Data dengan koordinat lat/lon
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

### POST /api/scrape

Generate data dummy (menggantikan scraping OSM)

```json
{
  "lat": -6.2088,
  "lon": 106.8456,
  "radius": 5000
}
```

Response: Data dummy UMKM (30-50), Wisata (20-30), dan Pelatihan (10-15)

### POST /api/clustering

Lakukan clustering pada data

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

1. **Untuk area padat UMKM**: Gunakan radius 2000-3000 meter
2. **Untuk area luas**: Gunakan radius 5000-10000 meter
3. **Optimal clusters**: 3-7 clusters untuk hasil terbaik
4. **AI Insight**: Tunggu clustering selesai sebelum generate insight
5. **Data Dummy**: Setiap request akan generate data baru yang random

## 🔄 Integrasi OpenStreetMap (Optional)

Untuk menggunakan data real dari OpenStreetMap, Anda bisa:

1. Uncomment code di `lib/services/openstreetmap.js`
2. Update `app/api/scrape/route.js` untuk menggunakan `openStreetMapService`
3. Pastikan koneksi internet stabil untuk query Overpass API

## 📄 License

MIT License

---

**Dibuat dengan ❤️ menggunakan Next.js, OpenStreetMap, dan Kolosal AI**
