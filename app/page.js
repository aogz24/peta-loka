"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  TrendingUp,
  GraduationCap,
  Search,
  Loader2,
} from "lucide-react";
import AIAgentPanel from "@/components/AIAgentPanel";
import ClusterStats from "@/components/ClusterStats";

// Dynamic import untuk MapComponent (client-side only)
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  ),
});

export default function Home() {
  const [center, setCenter] = useState([
    parseFloat(process.env.NEXT_PUBLIC_MAP_CENTER_LAT),
    parseFloat(process.env.NEXT_PUBLIC_MAP_CENTER_LNG),
  ]); // Jakarta default
  const [radius, setRadius] = useState(5000);
  const [loading, setLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState(null);
  const [clusteringData, setClusteringData] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState("map");
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState("manual"); // manual, current, map

  // Auto-load data on mount
  useEffect(() => {
    handleScrapeAndCluster();
  }, []);

  const handleScrapeAndCluster = async () => {
    setLoading(true);
    try {
      // Step 1: Scrape data
      const scrapeResponse = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        const clusterResponse = await fetch("/api/clustering", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
      console.error("Error:", error);
      alert("Error loading data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = () => {
    handleScrapeAndCluster();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:invert-100">
      {/* Control Panel */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow p-5 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Latitude */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Latitude
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <svg
                    width="18"
                    height="18"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
                  </svg>
                </span>
                <input
                  type="number"
                  step="0.0001"
                  value={center[0]}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") return;

                    const parsed = parseFloat(val);
                    if (!isNaN(parsed)) {
                      setCenter([parsed, center[1]]);
                    }
                  }}
                  disabled={loading || mode !== "manual"}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Longitude */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Longitude
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <svg
                    width="18"
                    height="18"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </span>
                <input
                  type="number"
                  step="0.0001"
                  value={center[1]}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") return;

                    const parsed = parseFloat(val);
                    if (!isNaN(parsed)) {
                      setCenter([center[0], parsed]);
                    }
                  }}
                  disabled={loading || mode !== "manual"}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Radius */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Radius (meter)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <svg
                    width="18"
                    height="18"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L15 8H9L12 2zM12 22l-3-6h6l-3 6zM2 12l6-3v6l-6-3zM22 12l-6 3V9l6 3z" />
                  </svg>
                </span>
                <input
                  type="number"
                  step="500"
                  value={radius}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") return;
                    const parsed = parseFloat(val);
                    if (!isNaN(parsed)) {
                      const MIN = 225;
                      setRadius(parsed <= MIN ? MIN + 1 : parsed);
                    }
                  }}
                  disabled={loading}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Select Mode */}
          <div className="mt-4">
            <label className="font-semibold text-gray-700 text-sm">
              Metode Pemilihan Lokasi
            </label>
            <select
              value={mode}
              onChange={(e) => {
                const val = e.target.value;
                setMode(val);

                if (val === "current") {
                  navigator.geolocation.getCurrentPosition((pos) => {
                    setCenter([pos.coords.latitude, pos.coords.longitude]);
                  });
                }

                if (val === "map") {
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
          <button
            onClick={handleLocationChange}
            disabled={loading}
            className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold"
          >
            {loading ? "Memuat..." : "Cari Data"}
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-lg shadow-md">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("map")}
              className={`flex-1 py-3 px-6 font-semibold transition-colors ${
                activeTab === "map"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <MapPin className="w-5 h-5 inline mr-2" />
              Peta Clustering
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`flex-1 py-3 px-6 font-semibold transition-colors ${
                activeTab === "stats"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <TrendingUp className="w-5 h-5 inline mr-2" />
              Statistik & Analisis
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={`flex-1 py-3 px-6 font-semibold transition-colors ${
                activeTab === "ai"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <GraduationCap className="w-5 h-5 inline mr-2" />
              AI Insight
            </button>
          </div>
        </div>

        {showPicker && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white p-4 rounded-lg shadow-lg w-[600px] h-[500px] relative">
              <h2 className="font-semibold mb-2">Pilih Lokasi dari Peta</h2>

              <MapComponent
                center={center}
                zoom={13}
                selectMode={true}
                onSelectLocation={(lat, lon) => {
                  setCenter([lat, lon]);
                  setShowPicker(false);
                }}
              />

              <button
                onClick={() => setShowPicker(false)}
                className="absolute top-2 right-2 dark:invert-0 bg-red-600 text-white px-3 py-1 rounded"
              >
                X
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-b-lg shadow-md p-6">
          {activeTab === "map" && (
            <div className="space-y-6">
              <div className="h-[600px]">
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
                    <p className="text-gray-500">
                      {loading
                        ? "Memuat data..."
                        : 'Klik "Cari Data" untuk memulai'}
                    </p>
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Legend:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white"></div>
                    <span className="text-sm text-gray-700">UMKM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                    <span className="text-sm text-gray-700">Wisata Mikro</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-amber-500 rounded-full border-2 border-white"></div>
                    <span className="text-sm text-gray-700">Pelatihan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white"></div>
                    <span className="text-sm text-gray-700">
                      Cluster Center
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "stats" && (
            <div>
              {clusteringData &&
              clusteringData.overall?.clusters?.length > 0 ? (
                <ClusterStats clusteringData={clusteringData} />
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Belum ada data clustering. Lakukan pencarian terlebih
                    dahulu.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "ai" && (
            <div>
              {clusteringData &&
              clusteringData.overall?.clusters?.length > 0 ? (
                <AIAgentPanel clusteringData={clusteringData} center={center} />
              ) : (
                <div className="text-center py-12">
                  <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Belum ada data untuk analisis AI. Lakukan pencarian terlebih
                    dahulu.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
