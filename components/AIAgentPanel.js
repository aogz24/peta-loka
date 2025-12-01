"use client";

import { useState } from "react";
import { Send, Loader2, MapPin } from "lucide-react";

export default function AIAgentPanel({ clusteringData, onInsightGenerated }) {
  const [query, setQuery] = useState("");
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("clustering");
  
  // State untuk input koordinat
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radius, setRadius] = useState("5000");

  const generateInsight = async () => {
    if (!query && selectedType === "chat") return;
    
    // Validasi koordinat untuk area-potential
    if (selectedType === "area-potential") {
      if (!latitude || !longitude) {
        setInsight("Error: Silakan masukkan koordinat latitude dan longitude");
        return;
      }
      
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      
      if (isNaN(lat) || isNaN(lon)) {
        setInsight("Error: Koordinat harus berupa angka yang valid");
        return;
      }
      
      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        setInsight("Error: Koordinat tidak valid (latitude: -90 to 90, longitude: -180 to 180)");
        return;
      }
    }

    setLoading(true);
    try {
      let payload;
      
      if (selectedType === "chat") {
        payload = { type: "chat", data: { query, context: clusteringData } };
      } else if (selectedType === "area-potential") {
        // Kirim koordinat ke API untuk analisis area
        payload = { 
          type: selectedType, 
          data: {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            radius: parseInt(radius)
          }
        };
      } else {
        payload = { type: selectedType, data: clusteringData };
      }

      const response = await fetch("/api/ai-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        setInsight(result.insight);
        if (onInsightGenerated) {
          onInsightGenerated(result.insight);
        }
      } else {
        setInsight("Error: " + result.error);
      }
    } catch (error) {
      setInsight("Error generating insight: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
      <div className="border-b pb-3">
        <h2 className="text-2xl font-bold text-gray-800">
          🤖 AI Agent Insight
        </h2>
        <p className="text-sm text-gray-600">
          Dapatkan insight dari hasil clustering menggunakan AI
        </p>
      </div>

      {/* Type Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Tipe Analisis:
        </label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        >
          <option value="clustering">Analisis Clustering Lengkap</option>
          <option value="area-potential">Potensi Area</option>
          <option value="chat">Chat Custom</option>
        </select>
      </div>

      {/* Chat Input */}
      {selectedType === "chat" && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Pertanyaan Anda:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && generateInsight()}
              placeholder="Tanyakan sesuatu tentang data UMKM..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={generateInsight}
        disabled={loading || (selectedType === "chat" && !query)}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-md flex items-center justify-center gap-2 transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Generate Insight
          </>
        )}
      </button>

      {/* Insight Display */}
      {insight && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <span className="text-blue-600">💡</span>
            AI Insight:
          </h3>
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
            {insight}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="pt-4 border-t">
        <p className="text-xs text-gray-500 mb-2">Quick Actions:</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setSelectedType("clustering");
              setTimeout(generateInsight, 100);
            }}
            disabled={loading}
            className="text-xs bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 px-3 py-2 rounded transition-colors"
          >
            Analisis Lengkap
          </button>
          <button
            onClick={() => {
              setSelectedType("area-potential");
              setTimeout(generateInsight, 100);
            }}
            disabled={loading}
            className="text-xs bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 px-3 py-2 rounded transition-colors"
          >
            Cek Potensi Area
          </button>
        </div>
      </div>
    </div>
  );
}
