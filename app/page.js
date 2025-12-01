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
  const [center, setCenter] = useState([-6.2088, 106.8456]); // Jakarta default
  const [radius, setRadius] = useState(5000);
  const [loading, setLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState(null);
  const [clusteringData, setClusteringData] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState("map");

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                🗺️ PetaLoka UMKM
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Platform Pemetaan & Analisis UMKM dengan AI
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Data Sources</p>
                <p className="text-xs text-gray-500">
                  OpenStreetMap + Kolosal AI
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Control Panel */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={center[0]}
                onChange={(e) =>
                  setCenter([parseFloat(e.target.value), center[1]])
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={center[1]}
                onChange={(e) =>
                  setCenter([center[0], parseFloat(e.target.value)])
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Radius (meter)
              </label>
              <input
                type="number"
                step="500"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            <button
              onClick={handleLocationChange}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-md flex items-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Cari Data
                </>
              )}
            </button>
          </div>
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

        {/* Content */}
        <div className="bg-white rounded-b-lg shadow-md p-6">
          {activeTab === "map" && (
            <div className="space-y-6">
              <div className="h-[600px]">
                {scrapedData && clusteringData ? (
                  <MapComponent
                    center={center}
                    zoom={13}
                    umkmData={clusteringData.produkUnggulan.data || []}
                    wisataData={scrapedData.wisata || []}
                    pelatihanData={scrapedData.pelatihan || []}
                    centroids={clusteringData.produkUnggulan.centroids || []}
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
              {clusteringData ? (
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
              {clusteringData ? (
                <AIAgentPanel clusteringData={clusteringData} />
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

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>© 2024 PetaLoka UMKM - Powered by OpenStreetMap & Kolosal AI</p>
            <p className="mt-1 text-xs text-gray-500">
              Clustering dengan K-Means | AI Insight menggunakan Llama 4
              Maverick
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
