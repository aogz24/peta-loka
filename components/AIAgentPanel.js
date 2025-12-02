'use client';

import { useState } from 'react';
import { Send, Loader2, MapPin, Trash } from 'lucide-react';

// Fungsi untuk memformat insight agar lebih natural
const formatInsight = (text) => {
  if (!text) return '';

  return (
    text
      // Hapus markdown bold (**text**)
      .replace(/\*\*(.+?)\*\*/g, '$1')
      // Hapus markdown italic (*text* atau _text_)
      .replace(/([^*])\*([^*]+)\*([^*])/g, '$1$2$3')
      .replace(/_(.+?)_/g, '$1')
      // Hapus markdown headers (##, ###, dll)
      .replace(/^#{1,6}\s+/gm, '')
      // Hapus markdown list markers (-, *, +)
      .replace(/^[\*\-\+]\s+/gm, '• ')
      // Hapus code blocks
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`(.+?)`/g, '$1')
      // Bersihkan spasi berlebih
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
};

export default function AIAgentPanel({ clusteringData, onInsightGenerated, center, rad }) {
  const [query, setQuery] = useState('');
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('clustering');

  const generateInsight = async () => {
    if (!query && selectedType === 'chat') return;

    // Validasi koordinat untuk area-potential
    if (selectedType === 'area-potential') {
      if (!center || center.length !== 2) {
        setInsight('Error: Silakan masukkan koordinat latitude dan longitude');
        return;
      }

      const lat = parseFloat(center[0]);
      const lon = parseFloat(center[1]);

      if (isNaN(lat) || isNaN(lon)) {
        setInsight('Error: Koordinat harus berupa angka yang valid');
        return;
      }

      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        setInsight('Error: Koordinat tidak valid (latitude: -90 to 90, longitude: -180 to 180)');
        return;
      }
    }

    setLoading(true);
    try {
      let payload;

      if (selectedType === 'chat') {
        payload = { type: 'chat', data: { query, context: clusteringData } };
      } else if (selectedType === 'area-potential') {
        // Kirim koordinat ke API untuk analisis area
        payload = {
          type: selectedType,
          data: {
            latitude: parseFloat(center[0]),
            longitude: parseFloat(center[1]),
            radius: parseInt(rad || 5000),
          },
        };
      } else {
        payload = { type: selectedType, data: clusteringData };
      }

      const response = await fetch('/api/ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        const formattedInsight = formatInsight(result.insight);
        setInsight(formattedInsight);
        if (onInsightGenerated) {
          onInsightGenerated(formattedInsight);
        }
      } else {
        setInsight('Error: ' + result.error);
      }
    } catch (error) {
      setInsight('Error generating insight: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">AI Agent Insight</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Dapatkan insight dari hasil clustering menggunakan AI</p>
        </div>
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          Koordinat: <span className="font-medium text-zinc-700 dark:text-zinc-200">{center?.[0]?.toFixed ? `${center[0].toFixed(4)}, ${center[1].toFixed(4)}` : '—'}</span>
        </div>
      </div>

      {/* Type Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Tipe Analisis:</label>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedType('clustering')}
            disabled={loading}
            className={`px-3 py-1.5 rounded-full text-sm ${selectedType === 'clustering' ? 'bg-blue-600 text-white' : 'bg-transparent border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'}`}
          >
            Analisis Lengkap
          </button>
          <button
            onClick={() => setSelectedType('area-potential')}
            disabled={loading}
            className={`px-3 py-1.5 rounded-full text-sm ${selectedType === 'area-potential' ? 'bg-blue-600 text-white' : 'bg-transparent border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'}`}
          >
            Potensi Area
          </button>
          <button
            onClick={() => setSelectedType('chat')}
            disabled={loading}
            className={`px-3 py-1.5 rounded-full text-sm ${selectedType === 'chat' ? 'bg-blue-600 text-white' : 'bg-transparent border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'}`}
          >
            Chat Custom
          </button>
        </div>
      </div>

      {/* Area Potential Input */}
      {selectedType === 'area-potential' && (
        <div className="space-y-2">
          <div className="p-3 rounded-md bg-gradient-to-r from-blue-50 to-white/40 dark:from-blue-900/30 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <span className="font-semibold">Radius:</span> {rad || 5000} meter
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Radius otomatis dari peta saat ini</p>
          </div>
        </div>
      )}

      {/* Chat Input */}
      {selectedType === 'chat' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Pertanyaan Anda:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && generateInsight()}
              placeholder="Tanyakan sesuatu tentang data UMKM..."
              className="flex-1 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
        </div>
      )}

      {/* Generate Button */}
      <div className="flex gap-3">
        <button onClick={generateInsight} disabled={loading || (selectedType === 'chat' && !query)} className="flex-1 glass-btn inline-flex items-center justify-center gap-2 disabled:opacity-60">
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Generating...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span className="text-sm">Generate Insight</span>
            </>
          )}
        </button>
        <button
          onClick={() => {
            setInsight('');
            setQuery('');
          }}
          className="px-4 py-2 rounded-xl border hover:scale-105 transition-transform cursor-pointer border-zinc-200 dark:border-zinc-700 text-sm"
        >
          <Trash className="w-4 h-4 text-red-500 " />
        </button>
      </div>

      {/* Insight Display */}
      {insight && (
        <div className="glass-card p-4 border border-zinc-100 dark:border-zinc-800">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-3 flex items-center gap-2">
            <span className="text-amber-500">💡</span>
            Insight
          </h3>
          <div className="text-zinc-700 dark:text-zinc-200 leading-relaxed text-sm" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
            {insight}
          </div>
        </div>
      )}

      {/* Quick Actions
      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Quick Actions:</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedType('clustering');
              setTimeout(generateInsight, 100);
            }}
            disabled={loading}
            className="flex-1 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm"
          >
            Analisis Lengkap
          </button>
          <button
            onClick={() => {
              setSelectedType('area-potential');
              setTimeout(generateInsight, 100);
            }}
            disabled={loading}
            className="flex-1 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm"
          >
            Cek Potensi Area
          </button>
        </div>
      </div> */}
    </div>
  );
}
