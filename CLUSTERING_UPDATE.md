# Update Clustering - Peta Loka

## Ringkasan Perubahan

Clustering telah disesuaikan untuk bekerja dengan data dari `pelatihan.json`, `umkm.json`, dan `wisata.json`.

## Struktur Data yang Didukung

### Pelatihan (pelatihan.json)

```javascript
{
  "id": 31288438,
  "type": "pelatihan",
  "name": "SMPN 5",
  "category": "school", // school, university, college, kindergarten, community_centre
  "lat": -6.9147418,
  "lon": 107.614526,
  "address": "",
  "phone": "",
  "website": "",
  "openingHours": "",
  "description": "",
  "tags": {...}
}
```

### UMKM (umkm.json)

```javascript
{
  "id": 29391283,
  "type": "umkm",
  "name": "Setrasari Mall",
  "category": "mall", // mall, supermarket, convenience, department_store, dll
  "lat": -6.8807039,
  "lon": 107.5829931,
  "address": "",
  "phone": "",
  "website": "",
  "openingHours": "",
  "description": "",
  "tags": {...}
}
```

### Wisata (wisata.json)

```javascript
{
  "id": 29391348,
  "type": "wisata",
  "name": "Hotel Sukajadi",
  "category": "hotel", // hotel, restaurant, cafe, museum, swimming_pool, dll
  "lat": -6.8862096,
  "lon": 107.5970895,
  "address": "",
  "phone": "",
  "website": "",
  "openingHours": "",
  "description": "",
  "tags": {...}
}
```

## Fitur Clustering

### 1. Clustering UMKM (`clusterUMKM`)

- Mengelompokkan UMKM berdasarkan lokasi geografis
- Analisis kategori dominan per cluster
- Statistik kelengkapan data (alamat, telepon, website)
- Output: clusters, centroids, analysis, totalUMKM

### 2. Clustering Wisata (`clusterWisata`)

- Mengelompokkan tempat wisata berdasarkan lokasi
- Analisis kategori wisata per cluster
- Penilaian potensi wisata (Sangat Tinggi, Tinggi, Sedang, Rendah)
- Statistik kelengkapan data
- Output: clusters, centroids, analysis, totalWisata

### 3. Clustering Pelatihan (`clusterPelatihan`)

- Mengelompokkan tempat pelatihan berdasarkan lokasi
- Analisis jenis pelatihan per cluster
- Top 3 kategori pelatihan per cluster
- Output: clusters, centroids, analysis, totalPelatihan

### 4. Rekomendasi Pelatihan (`findNearestTraining`)

- Mencari 5 tempat pelatihan terdekat untuk setiap cluster UMKM
- Menghitung jarak rata-rata ke tempat pelatihan
- Berguna untuk rekomendasi pengembangan UMKM
- Output: training recommendations per cluster

### 5. Analisis Komprehensif (`analyzeAll`)

- Menggabungkan semua analisis (UMKM, Wisata, Pelatihan)
- Clustering gabungan untuk melihat distribusi keseluruhan
- Analisis density per cluster
- Summary statistik lengkap

## API Endpoints

### GET /api/clustering

Menggunakan data dari file JSON yang sudah ada.

**Query Parameters:**

- `clusters` (optional): Jumlah cluster yang diinginkan (default: 5)

**Example:**

```bash
GET /api/clustering?clusters=7
```

### POST /api/clustering

Menggunakan custom data atau data dari file.

**Request Body:**

```json
{
  "umkmData": [...], // optional, gunakan data dari file jika tidak ada
  "wisataData": [...], // optional
  "pelatihanData": [...], // optional
  "numClusters": 5 // optional, default: 5
}
```

## Response Structure

```json
{
  "success": true,
  "message": "Clustering completed successfully",
  "data": {
    "umkm": {
      "clusters": [...],
      "centroids": [...],
      "analysis": [...],
      "totalUMKM": 46443
    },
    "wisata": {
      "clusters": [...],
      "centroids": [...],
      "analysis": [...],
      "totalWisata": 52841
    },
    "pelatihan": {
      "clusters": [...],
      "centroids": [...],
      "analysis": [...],
      "totalPelatihan": 18557
    },
    "trainingRecommendations": [...],
    "overall": {
      "clusters": [...],
      "centroids": [...],
      "analysis": [...]
    },
    "summary": {
      "totalUMKM": 46443,
      "totalWisata": 52841,
      "totalPelatihan": 18557,
      "totalClusters": 5
    }
  }
}
```

## Contoh Analisis Per Cluster

### UMKM Analysis

```json
{
  "clusterId": 0,
  "center": { "lat": -6.9, "lon": 107.6 },
  "totalItems": 150,
  "categories": {
    "convenience": 45,
    "supermarket": 30,
    "restaurant": 25
  },
  "dominantCategory": "convenience",
  "completeness": {
    "withAddress": 120,
    "withPhone": 80,
    "withWebsite": 40,
    "percentage": 53
  }
}
```

### Wisata Analysis

```json
{
  "clusterId": 0,
  "center": { "lat": -6.9, "lon": 107.6 },
  "totalWisata": 200,
  "categories": {
    "hotel": 80,
    "restaurant": 70,
    "cafe": 50
  },
  "topCategories": [
    { "category": "hotel", "count": 80 },
    { "category": "restaurant", "count": 70 },
    { "category": "cafe", "count": 50 }
  ],
  "potensi": "Tinggi",
  "completeness": {
    "withOpeningHours": 150,
    "withPhone": 100,
    "withWebsite": 80,
    "percentage": 55
  }
}
```

### Training Recommendations

```json
{
  "clusterId": 0,
  "centroid": { "lat": -6.9, "lon": 107.6 },
  "totalUMKM": 150,
  "nearestTraining": [
    {
      "id": 1342944408,
      "name": "Universitas Padjajaran",
      "category": "university",
      "distance": 0.5,
      "address": "Jl. Ir. H. Juanda"
    }
  ],
  "averageDistance": "0.75"
}
```

## Cara Penggunaan

### 1. Menggunakan GET (data dari file)

```javascript
const response = await fetch("/api/clustering?clusters=5");
const data = await response.json();

console.log(data.data.umkm.analysis); // Analisis UMKM
console.log(data.data.wisata.analysis); // Analisis Wisata
console.log(data.data.trainingRecommendations); // Rekomendasi pelatihan
```

### 2. Menggunakan POST (custom data)

```javascript
const response = await fetch("/api/clustering", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    umkmData: customUmkm,
    wisataData: customWisata,
    pelatihanData: customPelatihan,
    numClusters: 7,
  }),
});
const data = await response.json();
```

## Metrik Penting

### Potensi Wisata

- **Sangat Tinggi**: Score ≥ 100 (banyak wisata + diverse + data lengkap)
- **Tinggi**: Score ≥ 70
- **Sedang**: Score ≥ 40
- **Rendah**: Score < 40

### Density

- **Sangat Tinggi**: Jarak rata-rata < 1 km
- **Tinggi**: Jarak rata-rata < 3 km
- **Sedang**: Jarak rata-rata < 5 km
- **Rendah**: Jarak rata-rata ≥ 5 km

### Completeness

Persentase kelengkapan data (alamat, telepon, website) dari total yang mungkin.

## Files Modified

1. `/lib/services/clustering.js` - Service utama clustering
2. `/app/api/clustering/route.js` - API endpoint

## Testing

Test API menggunakan curl:

```bash
# GET request
curl http://localhost:3000/api/clustering?clusters=5

# POST request
curl -X POST http://localhost:3000/api/clustering \
  -H "Content-Type: application/json" \
  -d '{"numClusters": 7}'
```
