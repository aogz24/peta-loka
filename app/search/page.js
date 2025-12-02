'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, TrendingUp, GraduationCap, Search, Loader2 } from 'lucide-react';
import AIAgentPanel from '@/components/AIAgentPanel';
import ClusterStats from '@/components/ClusterStats';

// Dynamic import untuk MapComponent (client-side only)
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  ),
});

export default function Home() {
  const [center, setCenter] = useState([parseFloat(process.env.NEXT_PUBLIC_MAP_CENTER_LAT), parseFloat(process.env.NEXT_PUBLIC_MAP_CENTER_LNG)]); // Jakarta default
  const [radius, setRadius] = useState(5000);
  const [loading, setLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState(null);
  const [clusteringData, setClusteringData] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('map');
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState('manual'); // manual, current, map

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
            numClusters: 5,
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-black py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Controls & Summary */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="block gap-4">
              {/* Latitude */}
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Latitude</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-zinc-400 dark:text-zinc-500">
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
                      if (!isNaN(parsed)) {
                        setCenter([parsed, center[1]]);
                      }
                    }}
                    disabled={loading || mode !== 'manual'}
                    className="w-full pl-12 pr-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Longitude */}
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Longitude</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-zinc-400 dark:text-zinc-500">
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
                      if (!isNaN(parsed)) {
                        setCenter([center[0], parsed]);
                      }
                    }}
                    disabled={loading || mode !== 'manual'}
                    className="w-full pl-12 pr-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Radius */}
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Radius (meter)</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-zinc-400 dark:text-zinc-500">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 2L15 8H9L12 2z" />
                    </svg>
                  </span>
                  <input
                    type="number"
                    step="500"
                    value={radius}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') return;
                      const parsed = parseFloat(val);
                      if (!isNaN(parsed)) {
                        const MIN = 225;
                        setRadius(parsed <= MIN ? MIN + 1 : parsed);
                      }
                    }}
                    disabled={loading}
                    className="w-full pl-12 pr-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mt-2">
                  <input
                    type="range"
                    min={225}
                    max={20000}
                    step={500}
                    value={radius}
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      setRadius(v <= 225 ? 226 : v);
                    }}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Select Mode */}
            <div className="mt-4">
              <label className="font-semibold text-gray-700 text-sm">Metode Pemilihan Lokasi</label>
              <select
                value={mode}
                onChange={(e) => {
                  const val = e.target.value;
                  setMode(val);

                  if (val === 'current') {
                    navigator.geolocation.getCurrentPosition((pos) => {
                      setCenter([pos.coords.latitude, pos.coords.longitude]);
                    });
                  }

                  if (val === 'map') {
                    setShowPicker(true);
                  }
                }}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="manual">Input Manual</option>
                <option value="current">Gunakan Lokasi Saat Ini</option>
                <option value="map">Pilih Lewat Peta</option>
              </select>
            </div>

            {/* Button */}
            <button onClick={handleLocationChange} disabled={loading} className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold">
              {loading ? 'Memuat...' : 'Cari Data'}
            </button>
          </aside>

          {/* Right: Map and Panels */}
          <main className="lg:col-span-2 space-y-6">
            <div className="glass-card p-0 overflow-hidden">
              <div className="h-[560px]">
                {scrapedData && clusteringData ? (
                  <MapComponent
                    center={center}
                    zoom={13}
                    umkmData={clusteringData.umkm?.data || []}
                    wisataData={scrapedData.wisata || []}
                    pelatihanData={scrapedData.pelatihan || []}
                    centroids={clusteringData.umkm?.centroids || []}
                    selectedItem={selectedItem}
                    onMarkerClick={setSelectedItem}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                    <p className="text-gray-500">{loading ? 'Memuat data...' : 'Klik "Cari Data" untuk memulai'}</p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
        <div className=" gap-4 w-full mt-4">
          <div className="md:col-span-2 glass-card">
            <div className="flex items-center gap-4">
              <button onClick={() => setActiveTab('map')} className={`px-3 py-2 rounded-md text-sm ${activeTab === 'map' ? 'bg-blue-600 text-white' : 'bg-transparent text-zinc-700 dark:text-zinc-200'}`}>
                Map
              </button>
              <button onClick={() => setActiveTab('stats')} className={`px-3 py-2 rounded-md text-sm ${activeTab === 'stats' ? 'bg-blue-600 text-white' : 'bg-transparent text-zinc-700 dark:text-zinc-200'}`}>
                Stats
              </button>
              <button onClick={() => setActiveTab('ai')} className={`px-3 py-2 rounded-md text-sm ${activeTab === 'ai' ? 'bg-blue-600 text-white' : 'bg-transparent text-zinc-700 dark:text-zinc-200'}`}>
                AI Insight
              </button>
            </div>

            <div className="mt-4">
              {activeTab === 'map' && (
                <div className="text-sm text-zinc-600 dark:text-zinc-300">
                  {/* Legend */}

                  <p className="pl-4 ">Interaksi peta: klik marker untuk detail, daftar di kiri memudahkan navigasi.</p>
                  <div className="glass-card rounded-lg p-4">
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
                  <ClusterStats clusteringData={clusteringData} />
                ) : (
                  <div className="text-sm text-zinc-500 py-8 text-center">Belum ada data clustering. Jalankan pencarian terlebih dahulu.</div>
                ))}

              {activeTab === 'ai' &&
                (clusteringData && clusteringData.overall?.clusters?.length > 0 ? (
                  <AIAgentPanel clusteringData={clusteringData} center={center} rad={radius} />
                ) : (
                  <div className="text-sm text-zinc-500 py-8 text-center">Analisis AI akan tersedia setelah data diperoleh.</div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
