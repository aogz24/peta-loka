'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, TrendingUp, GraduationCap, Search, Loader2, MapPinned } from 'lucide-react';
import AIAgentPanel from '@/components/AIAgentPanel';
import ClusterStats from '@/components/ClusterStats';
import LocationPredictionPanel from '@/components/LocationPredictionPanel';
import CompetitorAnalysisPanel from '@/components/CompetitorAnalysisPanel';
import RecommendationPanel from '@/components/RecommendationPanel';

// Dynamic import untuk MapComponent (client-side only)
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-100" />
    </div>
  ),
});

export default function SearchUMKM() {
  const [center, setCenter] = useState([parseFloat(process.env.NEXT_PUBLIC_MAP_CENTER_LAT), parseFloat(process.env.NEXT_PUBLIC_MAP_CENTER_LNG)]); // Jakarta default
  const [radius, setRadius] = useState(5000);
  const [numClusters, setNumClusters] = useState(5);
  const [loading, setLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState(null);
  const [clusteringData, setClusteringData] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('map');
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState('manual'); // manual, current, map
  const [zoom, setZoom] = useState(13);

  // Auto-load data on mount
  useEffect(() => {
    handleScrapeAndCluster();
  }, []);

  const handleScrapeAndCluster = async () => {
    setLoading(true);
    try {
      // Step 1: Scrape data
      const scrapeResponse = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: center[0],
          lon: center[1],
          radius,
        }),
      });

      const scrapeResult = await scrapeResponse.json();

      if (scrapeResult.success) {
        setScrapedData(scrapeResult.data);

        // Step 2: Perform clustering
        const clusterResponse = await fetch('/api/clustering', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            umkmData: scrapeResult.data.umkm,
            wisataData: scrapeResult.data.wisata,
            pelatihanData: scrapeResult.data.pelatihan,
            numClusters: numClusters,
          }),
        });

        const clusterResult = await clusterResponse.json();

        if (clusterResult.success) {
          setClusteringData(clusterResult.data);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error loading data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = () => {
    handleScrapeAndCluster();
    setZoom(13);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-black py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Controls & Summary */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Header Section */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight flex gap-2 items-center bg-linear-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(59,130,246,0.35)]">
                <MapPinned className="text-blue-600/70" /> Cari Potensi UMKM
              </h2>

              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Temukan potensi UMKM dalam radius tertentu berdasarkan lokasi pilihan Anda.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur border border-zinc-200/60 dark:border-zinc-700 shadow-lg space-y-5">
              {/* Latitude */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Latitude</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-400 dark:text-zinc-500">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z" />
                      <circle cx="12" cy="9.5" r="2" strokeWidth="1.2" />
                    </svg>
                  </span>

                  <input
                    type="number"
                    step="0.0001"
                    value={center[0]}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') return;
                      const parsed = parseFloat(val);
                      if (!isNaN(parsed)) setCenter([parsed, center[1]]);
                    }}
                    disabled={loading || mode !== 'manual'}
                    className="w-full pl-12 pr-3 py-2.5 rounded-xl bg-white dark:bg-zinc-900 
                   border border-zinc-300 dark:border-zinc-700 
                   text-zinc-900 dark:text-zinc-100
                   shadow-sm focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Longitude */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Longitude</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-400 dark:text-zinc-500">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle cx="12" cy="12" r="9" strokeWidth="1.4" />
                    </svg>
                  </span>

                  <input
                    type="number"
                    step="0.0001"
                    value={center[1]}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') return;
                      const parsed = parseFloat(val);
                      if (!isNaN(parsed)) setCenter([center[0], parsed]);
                    }}
                    disabled={loading || mode !== 'manual'}
                    className="w-full pl-12 pr-3 py-2.5 rounded-xl bg-white dark:bg-zinc-900 
                   border border-zinc-300 dark:border-zinc-700 
                   text-zinc-900 dark:text-zinc-100 
                   shadow-sm focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Radius */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Radius (meter)</label>

                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-400 dark:text-zinc-500">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 2L15 8H9L12 2z" />
                    </svg>
                  </span>

                  <input
                    type="number"
                    step="500"
                    value={radius}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) setRadius(val <= 1000 ? 1000 : val);
                    }}
                    disabled={loading}
                    className="w-full pl-12 pr-3 py-2.5 rounded-xl bg-white dark:bg-zinc-900 
                   border border-zinc-300 dark:border-zinc-700
                   text-zinc-900 dark:text-zinc-100 
                   shadow-sm focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <input type="range" min={1000} max={20000} step={500} value={radius} onChange={(e) => setRadius(parseInt(e.target.value))} className="w-full accent-blue-600 cursor-pointer" />
              </div>

              {/* Jumlah Cluster */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Jumlah Cluster</label>

                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-400 dark:text-zinc-500">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                  </span>

                  <input
                    type="number"
                    min={2}
                    max={10}
                    value={numClusters}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val >= 2 && val <= 10) {
                        setNumClusters(val);
                      }
                    }}
                    disabled={loading}
                    className="w-full pl-12 pr-3 py-2.5 rounded-xl bg-white dark:bg-zinc-900 
                   border border-zinc-300 dark:border-zinc-700
                   text-zinc-900 dark:text-zinc-100 
                   shadow-sm focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <input type="range" min={2} max={10} step={1} value={numClusters} onChange={(e) => setNumClusters(parseInt(e.target.value))} disabled={loading} className="w-full accent-blue-600 cursor-pointer" />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Pilih 2-10 cluster untuk mengelompokkan data</p>
              </div>
            </div>

            {/* Method Buttons */}
            <div className="mt-4 space-y-2">
              <label className="font-semibold text-gray-700 text-sm">Metode Pemilihan Lokasi</label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Manual Input */}
                <button
                  onClick={() => setMode('manual')}
                  className={`px-3 py-2 rounded-lg border font-medium transition ${
                    mode === 'manual' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900 dark:text-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-zinc-200 text-zinc-700'
                  }`}
                >
                  Input Manual
                </button>

                {/* Pilih dari Peta */}
                <button
                  onClick={() => {
                    setShowPicker(true);
                    setMode('picker');
                  }}
                  className={`px-3 py-2 rounded-lg border font-medium transition ${
                    mode === 'picker' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900 dark:text-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-zinc-200 text-zinc-700'
                  }`}
                >
                  Pilih Lokasi Lewat Peta
                </button>
              </div>
            </div>

            {/* Button */}
            <button onClick={handleLocationChange} disabled={loading} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold">
              {loading ? 'Memuat...' : 'Cari Data'}
            </button>
          </aside>

          {showPicker && (
            <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 h-full w-full">
              <div className="bg-white dark:bg-gray-900 dark:text-white p-4 rounded-lg shadow-lg lg:w-1/2 w-3/4 h-3/4 relative overflow-auto">
                <h2 className="font-semibold mb-2">Pilih Lokasi dari Peta</h2>

                <MapComponent
                  className="h-full rounded-lg"
                  center={center}
                  zoom={13}
                  radius={radius}
                  selectMode
                  onSelectLocation={(lat, lon) => {
                    setCenter([lat, lon]);
                    setShowPicker(false);
                  }}
                />

                <button onClick={() => setShowPicker(false)} className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded">
                  X
                </button>
              </div>
            </div>
          )}

          {/* Right: Map and Panels */}
          <main className="lg:col-span-2 space-y-6">
            <div className="glass-card p-0 overflow-hidden">
              <div className="h-[560px]">
                {scrapedData && clusteringData ? (
                  <MapComponent
                    center={center}
                    zoom={zoom}
                    radius={radius}
                    umkmData={scrapedData.umkm || []}
                    wisataData={scrapedData.wisata || []}
                    pelatihanData={scrapedData.pelatihan || []}
                    centroids={clusteringData.umkm?.centroids || []}
                    selectedItem={selectedItem}
                    onMarkerClick={setSelectedItem}
                  />
                ) : (
<<<<<<< HEAD
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">
                      {loading
                        ? "Memuat data..."
                        : 'Klik "Cari Data" untuk memulai'}
                    </p>
=======
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                    <p className="text-gray-500">{loading ? 'Memuat data...' : 'Klik "Cari Data" untuk memulai'}</p>
>>>>>>> d2ba357aeeb9a820e31b2f521302684bf8a313a2
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
        <div className=" gap-4 w-full mt-4">
          <div className="md:col-span-2 glass-card">
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('map')}
                className={`px-3 py-2 rounded-md text-sm whitespace-nowrap ${activeTab === 'map' ? 'bg-blue-600 text-white' : 'bg-transparent text-zinc-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
              >
                🗺️ Map
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-3 py-2 rounded-md text-sm whitespace-nowrap ${activeTab === 'stats' ? 'bg-blue-600 text-white' : 'bg-transparent text-zinc-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
              >
                📊 Stats
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`px-3 py-2 rounded-md text-sm whitespace-nowrap ${activeTab === 'ai' ? 'bg-blue-600 text-white' : 'bg-transparent text-zinc-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
              >
                🤖 AI Insight
              </button>
              <button
                onClick={() => setActiveTab('prediction')}
                className={`px-3 py-2 rounded-md text-sm whitespace-nowrap ${activeTab === 'prediction' ? 'bg-blue-600 text-white' : 'bg-transparent text-zinc-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
              >
                🎯 Prediksi Lokasi
              </button>
              <button
                onClick={() => setActiveTab('competitor')}
                className={`px-3 py-2 rounded-md text-sm whitespace-nowrap ${activeTab === 'competitor' ? 'bg-blue-600 text-white' : 'bg-transparent text-zinc-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
              >
                🎯 Analisis Kompetitor
              </button>
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`px-3 py-2 rounded-md text-sm whitespace-nowrap ${activeTab === 'recommendations' ? 'bg-blue-600 text-white' : 'bg-transparent text-zinc-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
              >
                ✨ Rekomendasi
              </button>
            </div>

            <div className="mt-4">
              {activeTab === 'map' && (
                <div className="text-sm text-zinc-600 dark:text-zinc-300">
                  {/* Legend */}

                  <p className="pl-4 ">Interaksi peta: klik marker untuk detail, daftar di kiri memudahkan navigasi.</p>
                  <div className="glass-card rounded-lg p-4 mt-2">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Legend:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">UMKM</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Wisata Mikro</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-amber-500 rounded-full border-2 border-white"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Pelatihan</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Cluster Center</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'stats' &&
                (clusteringData && clusteringData.overall?.clusters?.length > 0 ? (
                  <ClusterStats clusteringData={clusteringData} radius={radius} />
                ) : (
                  <div className="text-sm text-zinc-500 py-8 text-center">Belum ada data clustering. Jalankan pencarian terlebih dahulu.</div>
                ))}

              {activeTab === 'ai' &&
                (clusteringData && clusteringData.overall?.clusters?.length > 0 ? (
                  <AIAgentPanel clusteringData={clusteringData} center={center} rad={radius} />
                ) : (
                  <div className="text-sm text-zinc-500 py-8 text-center">Analisis AI akan tersedia setelah data diperoleh.</div>
                ))}

              {activeTab === 'prediction' && (
                <LocationPredictionPanel
                  onLocationSelect={(active) => {
                    setMapSelectorActive(active);
                  }}
                  selectedLocation={selectedLocation}
                />
              )}

              {activeTab === "prediction" && (
                <LocationPredictionPanel
                  onLocationSelect={(lat, lng) => {
                    setCenter([lat, lng]);
                    setZoom(15);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )}

              {activeTab === 'competitor' && (
                <CompetitorAnalysisPanel
                  onLocationSelect={(lat, lng) => {
                    setCenter([lat, lng]);
                    setZoom(15);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )}

              {activeTab === 'recommendations' && (
                <RecommendationPanel
                  onItemClick={(item) => {
                    setSelectedItem(item);
                    if (item.lat && item.lon) {
                      setCenter([item.lat, item.lon]);
                    }
                    setActiveTab('map');
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
