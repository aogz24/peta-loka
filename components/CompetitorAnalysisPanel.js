"use client";

<<<<<<< HEAD
import { useState } from "react";
import {
  Target,
  TrendingDown,
  AlertCircle,
  Loader2,
  MapPin,
} from "lucide-react";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin" />
=======
import { useState } from 'react';
import { Target, TrendingDown, AlertCircle, Loader2, MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
// Dynamic import untuk MapComponent (client-side only)
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-100" />
>>>>>>> d2ba357aeeb9a820e31b2f521302684bf8a313a2
    </div>
  ),
});

export default function CompetitorAnalysisPanel({ onLocationSelect }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [category, setCategory] = useState("");
  const [radius, setRadius] = useState(1.0);
  const [includeAll, setIncludeAll] = useState(false);
<<<<<<< HEAD
  const [showMapPicker, setShowMapPicker] = useState(false);
=======
  const [mode, setMode] = useState('manual'); // 'manual' or 'picker'
  const [showPicker, setShowPicker] = useState(false);
>>>>>>> d2ba357aeeb9a820e31b2f521302684bf8a313a2

  const handleAnalyze = async () => {
    if (!lat || !lng) {
      alert("Masukkan koordinat atau klik pada peta");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/competitor-analysis?lat=${lat}&lng=${lng}&category=${category}&radius=${radius}&includeAll=${includeAll}`
      );
      const data = await response.json();

      if (data.success) {
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSaturationColor = (level) => {
    switch (level) {
      case "Very Low":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700";
      case "Low":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700";
      case "Moderate":
        return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700";
      case "High":
        return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700";
      case "Very High":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700";
    }
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "opportunity":
        return <TrendingDown className="w-5 h-5 text-green-500" />;
      default:
        return <Target className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200 dark:from-purple-900 dark:to-pink-900 dark:border-purple-700">
        <h3 className="font-semibold text-lg mb-2 flex items-center">
          <Target className="w-5 h-5 mr-2 text-purple-600" />
          Analisis Kompetitor
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-200">
          Analisis kompetitor dalam radius tertentu untuk memahami tingkat
          kompetisi dan peluang pasar
        </p>
      </div>

      {/* Input Form */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
<<<<<<< HEAD
            <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-gray-300">
              Latitude
            </label>
            <input
              type="number"
              step="0.000001"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 rounded-lg text-sm"
              placeholder="-6.914742"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-gray-300">
              Longitude
            </label>
            <input
              type="number"
              step="0.000001"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 rounded-lg text-sm"
              placeholder="107.614526"
            />
          </div>
        </div>

        {/* Button Pilih dari Peta */}
        <button
          onClick={() => setShowMapPicker(true)}
          className="w-full py-2 px-4 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
        >
          <MapPin className="w-4 h-4" />
          Pilih Lokasi dari Peta
        </button>
=======
            <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-gray-300">Latitude</label>
            <input type="number" step="0.000001" disabled={mode !== 'manual'} value={lat} onChange={(e) => setLat(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="-6.914742" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Longitude</label>
            <input type="number" step="0.000001" disabled={mode !== 'manual'} value={lng} onChange={(e) => setLng(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="107.614526" />
          </div>
        </div>

        {/* Method Buttons */}
        <div className="mt-4 space-y-2">
          <label className=" text-gray-700 text-xs">Metode Pemilihan Lokasi</label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Manual Input */}
            <button
              onClick={() => setMode('manual')}
              className={`px-3 py-2 rounded-lg border font-medium transition text-xs ${
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
              className={`px-3 py-2 rounded-lg border font-medium transition text-xs ${
                mode === 'picker' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900 dark:text-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-zinc-200 text-zinc-700'
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
                radius={radius}
                selectMode
                onSelectLocation={(lat, lon) => {
                  setLat(lat);
                  setLng(lon);
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
            Kategori (opsional)
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 rounded-lg text-sm"
            placeholder="e.g., Kuliner, Kerajinan"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-gray-300">
            Radius Analisis (km): {radius}
          </label>
          <input
            type="range"
            min="0.3"
            max="5"
            step="0.1"
            value={radius}
            onChange={(e) => setRadius(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="includeAll"
            checked={includeAll}
            onChange={(e) => setIncludeAll(e.target.checked)}
            className="mr-2"
          />
          <label
            htmlFor="includeAll"
            className="text-sm text-gray-700 dark:text-gray-300"
          >
            Tampilkan semua kategori
          </label>
        </div>

        <button
          onClick={handleAnalyze}
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
              <Target className="w-4 h-4 inline mr-2" />
              Analyze Competitors
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {analysis && (
        <div className="mt-6 space-y-4">
          {/* Summary Card */}
          <div
            className={`p-4 rounded-lg border-2 ${getSaturationColor(
              analysis.summary.saturationLevel
            )}`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-2xl font-bold">
                  {analysis.summary.totalCompetitors} Kompetitor
                </div>
                <div className="text-sm opacity-75">
                  dalam radius {analysis.summary.radius} km
                </div>
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-bold border">
                {analysis.summary.saturationLevel}
              </div>
            </div>
            <p className="text-sm mb-3">
              {analysis.summary.saturationDescription}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-gray-900 bg-opacity-50 p-3 rounded">
                <div className="text-xs opacity-75">Intensity Score</div>
                <div className="text-xl font-bold">
                  {analysis.summary.intensityScore}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 bg-opacity-50 p-3 rounded">
                <div className="text-xs opacity-75">Opportunity Score</div>
                <div className="text-xl font-bold">
                  {analysis.summary.opportunityScore}
                </div>
              </div>
            </div>
          </div>

          {/* Density Zones */}
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold mb-3 flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Zona Kepadatan
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Sangat Dekat (0-300m)</span>
                <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-full text-sm font-semibold">
                  {analysis.densityZones.veryClose}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Dekat (300-700m)</span>
                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 rounded-full text-sm font-semibold">
                  {analysis.densityZones.close}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Sedang (700m+)</span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-full text-sm font-semibold">
                  {analysis.densityZones.moderate}
                </span>
              </div>
            </div>
          </div>

          {/* By Category */}
          {analysis.byCategory.length > 0 && (
            <div className="bg-white p-4 rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
              <h4 className="font-semibold mb-3">Kompetitor per Kategori</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {analysis.byCategory.map((cat, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{cat.category}</div>
                      <div className="text-xs text-gray-500">
                        Terdekat: {cat.nearest} ({cat.nearestDistance} km)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{cat.count}</div>
                      <div className="text-xs text-gray-500">
                        {cat.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Competitors */}
          {analysis.topCompetitors.length > 0 && (
            <div className="bg-white p-4 rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
              <h4 className="font-semibold mb-3">Top Kompetitor Terdekat</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {analysis.topCompetitors.map((comp, idx) => (
                  <div
                    key={idx}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{comp.name}</div>
                        <div className="text-xs text-gray-500">
                          {comp.category}
                        </div>
                        {comp.address !== "N/A" && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {comp.address}
                          </div>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-blue-600">
                        {comp.distance} km
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strategic Recommendations */}
          {analysis.recommendations.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200 dark:from-blue-900 dark:to-purple-900 dark:border-blue-700">
              <h4 className="font-semibold mb-3">Rekomendasi Strategis</h4>
              <div className="space-y-3">
                {analysis.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-gray-900 p-3 rounded-lg"
                  >
                    <div className="flex items-start gap-2">
                      {getRecommendationIcon(rec.type)}
                      <div className="flex-1">
                        <div className="font-medium text-sm">{rec.title}</div>
                        <div className="text-xs text-gray-600 mt-1 dark:text-gray-400">
                          {rec.description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
                  lat && lng
                    ? [parseFloat(lat), parseFloat(lng)]
                    : [-6.2088, 106.8456]
                }
                zoom={13}
                selectMode
                onSelectLocation={(selectedLat, selectedLng) => {
                  setLat(selectedLat.toFixed(6));
                  setLng(selectedLng.toFixed(6));
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
