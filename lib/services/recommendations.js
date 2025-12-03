/**
 * Personalized Recommendation Service
 * Rekomendasi berdasarkan user behavior tracking
 */

import { calculateDistance } from '../utils/distance';

/**
 * User behavior tracker
 * Track: view, click, search, favorite
 */
export class UserBehaviorTracker {
  constructor() {
    this.behaviors = this.loadBehaviors();
  }

  loadBehaviors() {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('user_behaviors');
    return stored ? JSON.parse(stored) : [];
  }

  saveBehaviors() {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user_behaviors', JSON.stringify(this.behaviors));
  }

  /**
   * Track user interaction
   * @param {string} type - 'view', 'click', 'search', 'favorite'
   * @param {Object} data - {umkmId, category, lat, lng, name}
   */
  track(type, data) {
    const behavior = {
      type,
      timestamp: Date.now(),
      ...data
    };

    this.behaviors.push(behavior);

    // Keep only last 100 behaviors
    if (this.behaviors.length > 100) {
      this.behaviors = this.behaviors.slice(-100);
    }

    this.saveBehaviors();
  }

  /**
   * Get behaviors dalam timeframe tertentu
   * @param {number} days - Default 30 days
   */
  getRecentBehaviors(days = 30) {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    return this.behaviors.filter(b => b.timestamp >= cutoff);
  }

  /**
   * Clear all behaviors
   */
  clear() {
    this.behaviors = [];
    this.saveBehaviors();
  }

  /**
   * Get user preferences dari behavior
   */
  getUserPreferences() {
    const recent = this.getRecentBehaviors(30);

    // Count by category
    const categoryCount = recent.reduce((acc, b) => {
      if (b.category) {
        acc[b.category] = (acc[b.category] || 0) + 1;
      }
      return acc;
    }, {});

    // Count by type
    const typeCount = recent.reduce((acc, b) => {
      acc[b.type] = (acc[b.type] || 0) + 1;
      return acc;
    }, {});

    // Get favorite locations (area yang sering dilihat)
    const locations = recent
      .filter(b => b.lat && b.lng)
      .map(b => ({ lat: b.lat, lng: b.lng }));

    let centerLat = 0, centerLng = 0;
    if (locations.length > 0) {
      centerLat = locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length;
      centerLng = locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length;
    }

    return {
      totalBehaviors: recent.length,
      favoriteCategories: Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .map(([category, count]) => ({ category, count })),
      behaviorTypes: typeCount,
      centerOfInterest: locations.length > 0 ? { lat: centerLat, lng: centerLng } : null,
      mostViewedItems: this.getMostViewedItems(recent)
    };
  }

  getMostViewedItems(behaviors) {
    const itemCount = behaviors.reduce((acc, b) => {
      if (b.umkmId) {
        if (!acc[b.umkmId]) {
          acc[b.umkmId] = { id: b.umkmId, name: b.name, count: 0 };
        }
        acc[b.umkmId].count++;
      }
      return acc;
    }, {});

    return Object.values(itemCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }
}

/**
 * Generate personalized recommendations
 * @param {Array} umkmData
 * @param {Array} wisataData
 * @param {UserBehaviorTracker} tracker
 * @param {Object} options
 * @returns {Object} Recommendations
 */
export function generatePersonalizedRecommendations(umkmData, wisataData, tracker, options = {}) {
  const {
    maxRecommendations = 10,
    includeWisata = true,
    radiusFromCenter = 5.0 // km
  } = options;

  const preferences = tracker.getUserPreferences();

  // Jika tidak ada behavior, return popular items
  if (preferences.totalBehaviors === 0) {
    return {
      type: 'popular',
      message: 'Belum ada riwayat. Menampilkan UMKM populer.',
      recommendations: getPopularItems(umkmData, maxRecommendations)
    };
  }

  const recommendations = [];

  // 1. Category-based recommendations
  if (preferences.favoriteCategories.length > 0) {
    const topCategory = preferences.favoriteCategories[0].category;
    const sameCategoryItems = umkmData
      .filter(umkm => umkm.category === topCategory)
      .filter(umkm => !isAlreadyViewed(umkm.id, preferences.mostViewedItems))
      .slice(0, 3);

    sameCategoryItems.forEach(item => {
      recommendations.push({
        ...item,
        reason: `Kategori favorit Anda: ${topCategory}`,
        score: 95,
        type: 'category_match'
      });
    });
  }

  // 2. Location-based recommendations
  if (preferences.centerOfInterest) {
    const nearbyItems = umkmData
      .map(umkm => ({
        ...umkm,
        distance: calculateDistance(
          preferences.centerOfInterest.lat,
          preferences.centerOfInterest.lng,
          umkm.lat,
          umkm.lon
        )
      }))
      .filter(umkm => umkm.distance <= radiusFromCenter)
      .filter(umkm => !isAlreadyViewed(umkm.id, preferences.mostViewedItems))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);

    nearbyItems.forEach(item => {
      recommendations.push({
        ...item,
        reason: `Dekat dengan area yang Anda sering lihat (${Math.round(item.distance * 10) / 10} km)`,
        score: 85,
        type: 'location_based'
      });
    });
  }

  // 3. Similar to viewed items (collaborative filtering sederhana)
  if (preferences.mostViewedItems.length > 0) {
    const mostViewed = preferences.mostViewedItems[0];
    const viewedItem = umkmData.find(u => u.id === mostViewed.id);

    if (viewedItem) {
      const similarItems = umkmData
        .filter(umkm => umkm.category === viewedItem.category)
        .filter(umkm => umkm.id !== viewedItem.id)
        .filter(umkm => !isAlreadyViewed(umkm.id, preferences.mostViewedItems))
        .map(umkm => ({
          ...umkm,
          distance: calculateDistance(
            viewedItem.lat,
            viewedItem.lon,
            umkm.lat,
            umkm.lon
          )
        }))
        .filter(umkm => umkm.distance <= 2.0)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 2);

      similarItems.forEach(item => {
        recommendations.push({
          ...item,
          reason: `Mirip dengan ${mostViewed.name}`,
          score: 80,
          type: 'similar_items'
        });
      });
    }
  }

  // 4. Wisata recommendations (jika diminta)
  if (includeWisata && preferences.centerOfInterest) {
    const nearbyWisata = wisataData
      .map(wisata => ({
        ...wisata,
        distance: calculateDistance(
          preferences.centerOfInterest.lat,
          preferences.centerOfInterest.lng,
          wisata.lat,
          wisata.lon
        ),
        itemType: 'wisata'
      }))
      .filter(wisata => wisata.distance <= radiusFromCenter)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 2);

    nearbyWisata.forEach(item => {
      recommendations.push({
        ...item,
        reason: `Wisata menarik di area favorit Anda`,
        score: 75,
        type: 'nearby_attraction'
      });
    });
  }

  // 5. Diversify - tambahkan kategori lain yang belum dilihat
  const viewedCategories = new Set(preferences.favoriteCategories.map(c => c.category));
  const allCategories = [...new Set(umkmData.map(u => u.category))];
  const newCategories = allCategories.filter(cat => !viewedCategories.has(cat));

  if (newCategories.length > 0 && recommendations.length < maxRecommendations) {
    const diverseItems = umkmData
      .filter(umkm => newCategories.includes(umkm.category))
      .slice(0, 2);

    diverseItems.forEach(item => {
      recommendations.push({
        ...item,
        reason: `Eksplorasi kategori baru: ${item.category}`,
        score: 70,
        type: 'discovery'
      });
    });
  }

  // Sort by score dan limit
  const finalRecommendations = recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, maxRecommendations);

  return {
    type: 'personalized',
    message: `Rekomendasi berdasarkan ${preferences.totalBehaviors} interaksi Anda`,
    preferences: {
      topCategory: preferences.favoriteCategories[0]?.category || 'N/A',
      totalViews: preferences.totalBehaviors,
      centerOfInterest: preferences.centerOfInterest
    },
    recommendations: finalRecommendations
  };
}

function isAlreadyViewed(itemId, viewedItems) {
  return viewedItems.some(v => v.id === itemId);
}

function getPopularItems(umkmData, limit) {
  // Simple popular = first items (in real app, based on views/ratings)
  return umkmData.slice(0, limit).map(item => ({
    ...item,
    reason: 'UMKM populer',
    score: 60,
    type: 'popular'
  }));
}

/**
 * Get recommendations for specific category with personalization
 */
export function getRecommendationsByCategory(category, umkmData, tracker, options = {}) {
  const { maxRecommendations = 10 } = options;
  const preferences = tracker.getUserPreferences();

  let items = umkmData.filter(umkm => umkm.category === category);

  // Sort berdasarkan preference
  if (preferences.centerOfInterest) {
    items = items.map(item => ({
      ...item,
      distance: calculateDistance(
        preferences.centerOfInterest.lat,
        preferences.centerOfInterest.lng,
        item.lat,
        item.lon
      )
    })).sort((a, b) => a.distance - b.distance);
  }

  return items.slice(0, maxRecommendations).map(item => ({
    ...item,
    reason: preferences.centerOfInterest 
      ? `${Math.round(item.distance * 10) / 10} km dari area favorit Anda`
      : 'Kategori yang Anda pilih',
    score: 85,
    type: 'category_filter'
  }));
}

/**
 * Get "You might also like" recommendations
 */
export function getRelatedRecommendations(currentItem, umkmData, tracker, options = {}) {
  const { maxRecommendations = 5 } = options;

  // Find similar items berdasarkan kategori dan proximity
  const related = umkmData
    .filter(umkm => umkm.id !== currentItem.id)
    .map(umkm => ({
      ...umkm,
      distance: calculateDistance(
        currentItem.lat,
        currentItem.lon,
        umkm.lat,
        umkm.lon
      ),
      categoryMatch: umkm.category === currentItem.category
    }))
    .map(umkm => ({
      ...umkm,
      score: (umkm.categoryMatch ? 50 : 0) + Math.max(0, 50 - umkm.distance * 10)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxRecommendations);

  return related.map(item => ({
    ...item,
    reason: item.categoryMatch 
      ? `Kategori sama: ${item.category}`
      : `Dekat lokasi (${Math.round(item.distance * 10) / 10} km)`,
    type: 'related'
  }));
}
