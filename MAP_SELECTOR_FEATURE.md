# Map Selector Feature

## Deskripsi
Fitur map selector memungkinkan user untuk memilih lokasi analisis dengan mengklik langsung pada peta, tanpa perlu memasukkan koordinat secara manual.

## Fitur yang Diupdate

### 1. **Analisis Kompetitor** (`CompetitorAnalysisPanel`)
- Toggle button "Pilih dari Peta" untuk mengaktifkan map selector
- Saat aktif, user bisa klik pada peta untuk memilih lokasi
- Input latitude/longitude otomatis terisi dari klik peta
- Input manual di-disable saat map selector aktif

### 2. **Prediksi Lokasi** (`LocationPredictionPanel`)
- Toggle button "Pilih dari Peta" khusus untuk mode "Analyze Point"
- Saat aktif, user bisa klik pada peta untuk memilih lokasi
- Input latitude/longitude otomatis terisi dari klik peta
- Input manual di-disable saat map selector aktif

### 3. **Map Component** (`MapComponent`)
- Cursor berubah menjadi crosshair saat dalam select mode
- `MapClickHandler` component untuk menangani event klik pada peta
- Props baru:
  - `selectMode`: boolean untuk mengaktifkan mode select
  - `onSelectLocation`: callback function yang dipanggil saat peta diklik

### 4. **Search Page** (`app/search/page.js`)
- State management untuk `mapSelectorActive` dan `selectedLocation`
- Indikator visual di atas peta saat map selector aktif
- Integrasi dengan panel Analisis Kompetitor dan Prediksi Lokasi

## Cara Menggunakan

### Analisis Kompetitor
1. Buka tab "🎯 Analisis Kompetitor"
2. Klik tombol "Aktifkan" pada toggle "Pilih dari Peta"
3. Status berubah menjadi "Aktif - Klik Peta"
4. Klik lokasi yang diinginkan pada peta
5. Koordinat otomatis terisi
6. Klik "Analyze Competitors" untuk memulai analisis

### Prediksi Lokasi
1. Buka tab "🎯 Prediksi Lokasi"
2. Pilih mode "Analyze Point"
3. Klik tombol "Aktifkan" pada toggle "Pilih dari Peta"
4. Status berubah menjadi "Aktif - Klik Peta"
5. Klik lokasi yang diinginkan pada peta
6. Koordinat otomatis terisi
7. Klik "Analyze Location" untuk memulai analisis

## Indikator Visual
- **Toggle Button**: Berubah warna menjadi biru/hijau saat aktif
- **Cursor**: Berubah menjadi crosshair saat hover di peta
- **Notifikasi**: Banner "Klik pada peta untuk memilih lokasi" muncul di atas peta
- **Input Fields**: Disabled (abu-abu) saat map selector aktif

## Technical Details

### State Flow
```
1. User klik toggle → mapSelectorActive = true
2. User klik peta → selectedLocation = { lat, lng }
3. useEffect update input fields dengan selectedLocation
4. User klik Analyze → Proses analisis dimulai
```

### Props Chain
```
SearchPage
  ├─ mapSelectorActive (state)
  ├─ selectedLocation (state)
  │
  ├─ MapComponent
  │   ├─ selectMode={mapSelectorActive}
  │   └─ onSelectLocation={(lat, lng) => setSelectedLocation({lat, lng})}
  │
  ├─ CompetitorAnalysisPanel
  │   ├─ onLocationSelect={(active) => setMapSelectorActive(active)}
  │   └─ selectedLocation={selectedLocation}
  │
  └─ LocationPredictionPanel
      ├─ onLocationSelect={(active) => setMapSelectorActive(active)}
      └─ selectedLocation={selectedLocation}
```

## Benefits
✅ User experience lebih baik - tidak perlu copy-paste koordinat
✅ Mengurangi error input koordinat yang salah
✅ Lebih intuitif untuk analisis lokasi spesifik
✅ Terintegrasi dengan baik dengan fitur existing
