"use client";

import { useState } from "react";
import {
  MapPin,
  TrendingUp,
  Search,
  Loader2,
  Target,
  AlertTriangle,
} from "lucide-react";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  ),
});

import dynamic from 'next/dynamic';
// Dynamic import untuk MapComponent (client-side only)
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-100" />
    </div>
  ),
});

export default function LocationPredictionPanel({ onLocationSelect }) {
  const [mode, setMode] = useState("scan"); // 'scan' atau 'analyze'
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedLat, setSelectedLat] = useState("");
  const [selectedLng, setSelectedLng] = useState("");
  const [searchRadius, setSearchRadius] = useState(1.0);
<<<<<<< HEAD
  const [showMapPicker, setShowMapPicker] = useState(false);
=======
  const [modePoint, setModePoint] = useState('manual'); // 'manual' or 'picker'
  const [showPicker, setShowPicker] = useState(false);
>>>>>>> d2ba357aeeb9a820e31b2f521302684bf8a313a2

  const handleScanArea = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "/api/location-prediction?mode=scan&topN=10&minScore=50"
      );
      const data = await response.json();

      if (data.success) {
        setResults(data);
      }
    } catch (error) {
      console.error("Scan error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeLocation = async () => {
    if (!selectedLat || !selectedLng) {
      alert("Masukkan koordinat atau klik pada peta");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/location-prediction?mode=analyze&lat=${selectedLat}&lng=${selectedLng}&searchRadius=${searchRadius}`
      );
      const data = await response.json();

      if (data.success) {
        setResults(data);
      }
    } catch (error) {
      console.error("Analyze error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = (lat, lng) => {
    setSelectedLat(lat.toFixed(6));
    setSelectedLng(lng.toFixed(6));
    setMode("analyze");
  };

  const getRatingColor = (rating) => {
    switch (rating) {
      case "Sangat Potensial":
        return "text-green-600 bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-700 dark:text-green-200";
      case "Potensial":
        return "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200";
      case "Cukup Potensial":
        return "text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200";
      default:
        return "text-red-600 bg-red-50 border-red-200 dark:bg-red-900 dark:border-red-700 dark:text-red-200";
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode Selection */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("scan")}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            mode === "scan"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
        >
          <Search className="w-4 h-4 inline mr-2" />
          Scan Area
        </button>
        <button
          onClick={() => setMode("analyze")}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            mode === "analyze"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
        >
          <Target className="w-4 h-4 inline mr-2" />
          Analyze Point
        </button>
      </div>

      {/* Scan Mode */}
      {mode === "scan" && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Scan seluruh area untuk menemukan lokasi potensial dengan skor
            tertinggi
          </p>
          <button
            onClick={handleScanArea}
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Mulai Scan Area
              </>
            )}
          </button>
        </div>
      )}

      {/* Analyze Mode */}
      {mode === "analyze" && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-200">
            Klik pada peta atau masukkan koordinat untuk analisis lokasi
            spesifik
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
<<<<<<< HEAD
              <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-gray-300">
                Latitude
              </label>
              <input
                type="number"
                step="0.000001"
                value={selectedLat}
                onChange={(e) => setSelectedLat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 rounded-lg text-sm"
=======
              <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-gray-300">Latitude</label>
              <input
                type="number"
                step="0.000001"
                disabled={modePoint !== 'manual'}
                value={selectedLat}
                onChange={(e) => setSelectedLat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
>>>>>>> d2ba357aeeb9a820e31b2f521302684bf8a313a2
                placeholder="-6.914742"
              />
            </div>
            <div>
<<<<<<< HEAD
              <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-gray-300">
                Longitude
              </label>
              <input
                type="number"
                step="0.000001"
                value={selectedLng}
                onChange={(e) => setSelectedLng(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 rounded-lg text-sm"
=======
              <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-gray-300">Longitude</label>
              <input
                type="number"
                step="0.000001"
                disabled={modePoint !== 'manual'}
                value={selectedLng}
                onChange={(e) => setSelectedLng(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
>>>>>>> d2ba357aeeb9a820e31b2f521302684bf8a313a2
                placeholder="107.614526"
              />
            </div>
          </div>

<<<<<<< HEAD
          {/* Button Pilih dari Peta */}
          <button
            onClick={() => setShowMapPicker(true)}
            className="w-full py-2 px-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors flex items-center justify-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Pilih Lokasi dari Peta
          </button>
=======
          {/* Method Buttons */}
          <div className="mt-4 space-y-2">
            <label className=" text-gray-700 text-xs">Metode Pemilihan Lokasi</label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Manual Input */}
              <button
                onClick={() => setMode('manual')}
                className={`px-3 py-2 rounded-lg border font-medium transition text-xs ${
                  modePoint === 'manual' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900 dark:text-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-zinc-200 text-zinc-700'
                }`}
              >
                Input Manual
              </button>

              {/* Pilih dari Peta */}
              <button
                onClick={() => {
                  setShowPicker(true);
                  setModePoint('picker');
                }}
                className={`px-3 py-2 rounded-lg border font-medium transition text-xs ${
                  modePoint === 'picker' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900 dark:text-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-zinc-200 text-zinc-700'
                }`}
              >
                Pilih Lokasi Lewat Peta
              </button>
            </div>
          </div>

          {showPicker && (
            <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 h-full w-full">
              <div className="bg-white dark:bg-gray-900 dark:text-white p-4 rounded-lg shadow-lg lg:w-1/2 w-3/4 h-3/4 relative overflow-auto">
                <h2 className="font-semibold mb-2">Pilih Lokasi dari Peta</h2>

                <MapComponent
                  className="h-full rounded-lg"
                  center={[-6.914742, 107.614526]}
                  zoom={13}
                  radius={searchRadius}
                  selectMode
                  onSelectLocation={(lat, lon) => {
                    setSelectedLat(lat);
                    setSelectedLng(lon);
                    setShowPicker(false);
                  }}
                />

                <button onClick={() => setShowPicker(false)} className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded">
                  X
                </button>
              </div>
            </div>
          )}
>>>>>>> d2ba357aeeb9a820e31b2f521302684bf8a313a2
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-gray-300">
              Radius Analisis (km): {searchRadius}
            </label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={searchRadius}
              onChange={(e) => setSearchRadius(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <button
            onClick={handleAnalyzeLocation}
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 inline mr-2" />
                Analyze Location
              </>
            )}
          </button>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="mt-6 space-y-4">
          {results.mode === "scan" && (
            <>
              <h3 className="font-semibold text-lg">
                Top {results.count} Lokasi Potensial
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {results.locations.map((loc, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-2 cursor-pointer hover:shadow-md transition-shadow ${getRatingColor(
                      loc.rating
                    )}`}
                    onClick={() =>
                      onLocationSelect &&
                      onLocationSelect(loc.location.lat, loc.location.lng)
                    }
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold">
                          #{idx + 1} Score: {loc.score}
                        </div>
                        <div className="text-xs opacity-75">
                          {loc.location.lat.toFixed(4)},{" "}
                          {loc.location.lng.toFixed(4)}
                        </div>
                      </div>
                      <div className="px-3 py-1 rounded-full text-xs font-bold">
                        {loc.rating}
                      </div>
                    </div>
                    <p className="text-sm mt-2">{loc.recommendation}</p>
                    <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                      <div>
                        <div className="font-semibold">Kompetitor</div>
                        <div>{loc.details.competitors.count}</div>
                      </div>
                      <div>
                        <div className="font-semibold">Wisata</div>
                        <div>{loc.details.wisata.nearest.length} terdekat</div>
                      </div>
                      <div>
                        <div className="font-semibold">Pelatihan</div>
                        <div>
                          {loc.details.pelatihan.nearest.length} terdekat
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {results.mode === "analyze" && results.result && (
            <>
              <h3 className="font-semibold text-lg">Analisis Lokasi</h3>
              <div
                className={`p-4 rounded-lg border-2 ${getRatingColor(
                  results.result.rating
                )}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-2xl font-bold">
                      Score: {results.result.score}
                    </div>
                    <div className="text-sm opacity-75">
                      {results.result.location.lat.toFixed(6)},{" "}
                      {results.result.location.lng.toFixed(6)}
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full text-sm font-bold">
                    {results.result.rating}
                  </div>
                </div>
                <p className="mt-3 mb-4">{results.result.recommendation}</p>

                {/* Detailed Analysis */}
                <div className="space-y-3">
                  <div className="bg-white dark:bg-gray-900 bg-opacity-50 p-3 rounded">
                    <div className="font-semibold mb-2 flex items-center">
                      <Target className="w-4 h-4 mr-2" />
                      Kompetitor ({results.result.details.competitors.count})
                    </div>
                    <div className="text-sm space-y-1">
                      {results.result.details.competitors.list
                        .slice(0, 3)
                        .map((comp, i) => (
                          <div key={i} className="flex justify-between">
                            <span>{comp.name}</span>
                            <span className="text-xs opacity-75">
                              {comp.distance} km
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-900 bg-opacity-50 p-3 rounded">
                    <div className="font-semibold mb-2">Wisata Terdekat</div>
                    <div className="text-sm space-y-1">
                      {results.result.details.wisata.nearest.map(
                        (wisata, i) => (
                          <div key={i} className="flex justify-between">
                            <span>{wisata.name}</span>
                            <span className="text-xs opacity-75">
                              {wisata.distance} km
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-900 bg-opacity-50 p-3 rounded">
                    <div className="font-semibold mb-2">Pelatihan Terdekat</div>
                    <div className="text-sm space-y-1">
                      {results.result.details.pelatihan.nearest.map(
                        (pelatihan, i) => (
                          <div key={i} className="flex justify-between">
                            <span>{pelatihan.name}</span>
                            <span className="text-xs opacity-75">
                              {pelatihan.distance} km
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Map Picker Modal */}
      {showMapPicker && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-2/3 h-3/4 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg">Pilih Lokasi dari Peta</h2>
              <button
                onClick={() => setShowMapPicker(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="h-[calc(100%-60px)]">
              <MapComponent
                center={
                  selectedLat && selectedLng
                    ? [parseFloat(selectedLat), parseFloat(selectedLng)]
                    : [-6.2088, 106.8456]
                }
                zoom={13}
                selectMode
                onSelectLocation={(lat, lng) => {
                  setSelectedLat(lat.toFixed(6));
                  setSelectedLng(lng.toFixed(6));
                  setShowMapPicker(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
