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

export default function LocationPredictionPanel({ onLocationSelect }) {
  const [mode, setMode] = useState("scan"); // 'scan' atau 'analyze'
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedLat, setSelectedLat] = useState("");
  const [selectedLng, setSelectedLng] = useState("");
  const [searchRadius, setSearchRadius] = useState(1.0);

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
        return "text-green-600 bg-green-50 border-green-200";
      case "Potensial":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "Cukup Potensial":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-red-600 bg-red-50 border-red-200";
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
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
          <p className="text-sm text-gray-600">
            Klik pada peta atau masukkan koordinat untuk analisis lokasi
            spesifik
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="0.000001"
                value={selectedLat}
                onChange={(e) => setSelectedLat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="-6.914742"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="0.000001"
                value={selectedLng}
                onChange={(e) => setSelectedLng(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="107.614526"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
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
            className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-teal-700 disabled:opacity-50 transition-all"
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
                  <div className="bg-white bg-opacity-50 p-3 rounded">
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

                  <div className="bg-white bg-opacity-50 p-3 rounded">
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

                  <div className="bg-white bg-opacity-50 p-3 rounded">
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
    </div>
  );
}
