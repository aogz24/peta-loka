"use client";

import { useState } from "react";
import {
  Target,
  TrendingDown,
  AlertCircle,
  Loader2,
  MapPin,
} from "lucide-react";

export default function CompetitorAnalysisPanel({ onLocationSelect }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [category, setCategory] = useState("");
  const [radius, setRadius] = useState(1.0);
  const [includeAll, setIncludeAll] = useState(false);

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
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Low":
        return "bg-green-50 text-green-700 border-green-200";
      case "Moderate":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "High":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "Very High":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
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
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
        <h3 className="font-semibold text-lg mb-2 flex items-center">
          <Target className="w-5 h-5 mr-2 text-purple-600" />
          Analisis Kompetitor
        </h3>
        <p className="text-sm text-gray-600">
          Analisis kompetitor dalam radius tertentu untuk memahami tingkat
          kompetisi dan peluang pasar
        </p>
      </div>

      {/* Input Form */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Latitude
            </label>
            <input
              type="number"
              step="0.000001"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
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
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="107.614526"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Kategori (opsional)
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="e.g., Kuliner, Kerajinan"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
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
          <label htmlFor="includeAll" className="text-sm text-gray-700">
            Tampilkan semua kategori
          </label>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all"
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
              <div className="bg-white bg-opacity-50 p-3 rounded">
                <div className="text-xs opacity-75">Intensity Score</div>
                <div className="text-xl font-bold">
                  {analysis.summary.intensityScore}
                </div>
              </div>
              <div className="bg-white bg-opacity-50 p-3 rounded">
                <div className="text-xs opacity-75">Opportunity Score</div>
                <div className="text-xl font-bold">
                  {analysis.summary.opportunityScore}
                </div>
              </div>
            </div>
          </div>

          {/* Density Zones */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold mb-3 flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Zona Kepadatan
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Sangat Dekat (0-300m)</span>
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                  {analysis.densityZones.veryClose}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Dekat (300-700m)</span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                  {analysis.densityZones.close}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Sedang (700m+)</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  {analysis.densityZones.moderate}
                </span>
              </div>
            </div>
          </div>

          {/* By Category */}
          {analysis.byCategory.length > 0 && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold mb-3">Kompetitor per Kategori</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {analysis.byCategory.map((cat, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
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
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold mb-3">Top Kompetitor Terdekat</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {analysis.topCompetitors.map((comp, idx) => (
                  <div
                    key={idx}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{comp.name}</div>
                        <div className="text-xs text-gray-500">
                          {comp.category}
                        </div>
                        {comp.address !== "N/A" && (
                          <div className="text-xs text-gray-400 mt-1">
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
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold mb-3">Rekomendasi Strategis</h4>
              <div className="space-y-3">
                {analysis.recommendations.map((rec, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      {getRecommendationIcon(rec.type)}
                      <div className="flex-1">
                        <div className="font-medium text-sm">{rec.title}</div>
                        <div className="text-xs text-gray-600 mt-1">
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
    </div>
  );
}
