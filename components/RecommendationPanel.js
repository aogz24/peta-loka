'use client';

import { useState, useEffect } from 'react';
import { Heart, TrendingUp, Star, Sparkles, Loader2 } from 'lucide-react';
import { UserBehaviorTracker } from '@/lib/services/recommendations';

export default function RecommendationPanel({ onItemClick }) {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [tracker, setTracker] = useState(null);
  const [preferences, setPreferences] = useState(null);

  useEffect(() => {
    // Initialize tracker
    const behaviorTracker = new UserBehaviorTracker();
    setTracker(behaviorTracker);

    // Get preferences
    const prefs = behaviorTracker.getUserPreferences();
    setPreferences(prefs);
  }, []);

  const handleGetRecommendations = async () => {
    if (!tracker) return;

    setLoading(true);
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'personalized',
          behaviors: tracker.behaviors,
          options: {
            maxRecommendations: 10,
            includeWisata: true,
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setRecommendations(data);
      }
    } catch (error) {
      console.error('Recommendations error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemView = (item) => {
    if (tracker) {
      tracker.track('view', {
        umkmId: item.id,
        category: item.category,
        lat: item.lat,
        lng: item.lon,
        name: item.name,
      });
      setPreferences(tracker.getUserPreferences());
    }

    if (onItemClick) {
      onItemClick(item);
    }
  };

  const handleClearHistory = () => {
    if (tracker && confirm('Hapus semua riwayat aktivitas?')) {
      tracker.clear();
      setPreferences(tracker.getUserPreferences());
      setRecommendations(null);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'category_match':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'location_based':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'similar_items':
        return <Heart className="w-4 h-4 text-pink-500" />;
      case 'nearby_attraction':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      default:
        return <Star className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'category_match':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900 dark:border-yellow-700';
      case 'location_based':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900 dark:border-blue-700';
      case 'similar_items':
        return 'bg-pink-50 border-pink-200 dark:bg-pink-900 dark:border-pink-700';
      case 'nearby_attraction':
        return 'bg-purple-50 border-purple-200 dark:bg-purple-900 dark:border-purple-700';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700';
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg border border-pink-200 dark:from-pink-900 dark:to-purple-900 dark:border-pink-700">
        <h3 className="font-semibold text-lg mb-2 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
          Rekomendasi Personal
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">Rekomendasi UMKM dan wisata berdasarkan aktivitas browsing Anda</p>
      </div>

      {/* User Preferences Summary */}
      {preferences && preferences.totalBehaviors > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <h4 className="font-semibold mb-3">Profil Anda</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Total Aktivitas</span>
              <span className="font-semibold">{preferences.totalBehaviors}</span>
            </div>
            {preferences.favoriteCategories.length > 0 && (
              <div>
                <div className="text-gray-600 dark:text-gray-300 mb-1">Kategori Favorit</div>
                <div className="flex flex-wrap gap-2">
                  {preferences.favoriteCategories.slice(0, 3).map((cat, idx) => (
                    <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700  dark:bg-purple-900 dark:text-purple-300 rounded-full text-xs font-medium">
                      {cat.category} ({cat.count})
                    </span>
                  ))}
                </div>
              </div>
            )}
            {preferences.mostViewedItems.length > 0 && (
              <div>
                <div className="text-gray-600 mb-1 dark:text-gray-200">Paling Sering Dilihat</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {preferences.mostViewedItems[0].name} ({preferences.mostViewedItems[0].count}x)
                </div>
              </div>
            )}
          </div>
          <button onClick={handleClearHistory} className="mt-3 w-full py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:text-red-100 rounded-lg transition-colors">
            Hapus Riwayat
          </button>
        </div>
      )}

      {/* Get Recommendations Button */}
      <button
        onClick={handleGetRecommendations}
        disabled={loading}
        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 inline mr-2" />
            Dapatkan Rekomendasi
          </>
        )}
      </button>

      {/* Recommendations List */}
      {recommendations && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-3 rounded-lg dark:from-purple-900 dark:to-pink-900 border border-purple-200 dark:border-purple-700">
            <div className="font-semibold text-sm">{recommendations.message}</div>
            {recommendations.type === 'personalized' && recommendations.preferences && <div className="text-xs text-gray-600 mt-1 dark:text-gray-200">Top kategori: {recommendations.preferences.topCategory}</div>}
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recommendations.recommendations.map((item, idx) => (
              <div key={idx} className={`p-4 rounded-lg border-2 cursor-pointer hover:shadow-md transition-all ${getTypeColor(item.type)}`} onClick={() => handleItemView(item)}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-xs text-gray-500 mt-1 dark:text-gray-400">{item.category}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(item.type)}
                    <div className="text-sm font-bold">{item.score}</div>
                  </div>
                </div>

                <div className="flex items-start gap-2 mt-2 text-xs">
                  <Star className="w-3 h-3 mt-0.5 text-purple-500" />
                  <div className="text-gray-600 italic dark:text-gray-300">{item.reason}</div>
                </div>

                {item.distance !== undefined && <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">📍 {item.distance.toFixed(1)} km</div>}

                {item.itemType === 'wisata' && <div className="mt-2 px-2 py-1 bg-green-100 text-green-700 rounded text-xs inline-block dark:bg-green-900 dark:text-green-300">Wisata</div>}
              </div>
            ))}
          </div>

          {recommendations.recommendations.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Belum ada rekomendasi tersedia.</p>
              <p className="text-sm">Jelajahi peta untuk mendapat rekomendasi personal!</p>
            </div>
          )}
        </div>
      )}

      {/* No History State */}
      {preferences && preferences.totalBehaviors === 0 && !recommendations && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium mb-1">Belum Ada Riwayat</p>
          <p className="text-sm">Mulai jelajahi peta dan klik pada marker UMKM atau wisata untuk mendapatkan rekomendasi personal!</p>
        </div>
      )}
    </div>
  );
}
