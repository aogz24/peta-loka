/**
 * Location Prediction Service
 * Prediksi lokasi potensial untuk UMKM baru berdasarkan analisis:
 * - Density UMKM existing
 * - Proximity ke wisata
 * - Proximity ke tempat pelatihan
 * - Competition level
 */

import { calculateDistance } from '../utils/distance';

/**
 * Hitung skor potensi untuk sebuah lokasi
 * @param {Object} location - {lat, lng, name}
 * @param {Array} umkmData - Data UMKM existing
 * @param {Array} wisataData - Data wisata
 * @param {Array} pelatihanData - Data pelatihan
 * @param {Object} options - Config options
 * @returns {Object} Score dan detail
 */
export function calculateLocationPotential(location, umkmData, wisataData, pelatihanData, options = {}) {
  const {
    searchRadius = 1.0, // km
    competitorWeight = 0.3,
    wisataWeight = 0.35,
    pelatihanWeight = 0.35,
    optimalCompetitorCount = 3, // Sweet spot: ada kompetitor tapi tidak terlalu banyak
  } = options;

  // 1. Hitung jumlah kompetitor dalam radius
  const competitors = umkmData.filter(umkm => {
    const distance = calculateDistance(
      location.lat,
      location.lng,
      umkm.lat,
      umkm.lon
    );
    return distance <= searchRadius;
  });

  // 2. Hitung proximity ke wisata terdekat
  const wisataDistances = wisataData.map(wisata => ({
    ...wisata,
    distance: calculateDistance(
      location.lat,
      location.lng,
      wisata.lat,
      wisata.lon
    )
  }));
  const nearestWisata = wisataDistances.sort((a, b) => a.distance - b.distance).slice(0, 5);
  const avgWisataDistance = nearestWisata.length > 0
    ? nearestWisata.reduce((sum, w) => sum + w.distance, 0) / nearestWisata.length
    : searchRadius * 2;

  // 3. Hitung proximity ke pelatihan terdekat
  const pelatihanDistances = pelatihanData.map(pelatihan => ({
    ...pelatihan,
    distance: calculateDistance(
      location.lat,
      location.lng,
      pelatihan.lat,
      pelatihan.lon
    )
  }));
  const nearestPelatihan = pelatihanDistances.sort((a, b) => a.distance - b.distance).slice(0, 3);
  const avgPelatihanDistance = nearestPelatihan.length > 0
    ? nearestPelatihan.reduce((sum, p) => sum + p.distance, 0) / nearestPelatihan.length
    : searchRadius * 2;

  // 4. Hitung skor komponen
  // Kompetitor: optimal di sweet spot, penalty jika terlalu banyak atau terlalu sedikit
  const competitorCount = competitors.length;
  let competitorScore;
  if (competitorCount === 0) {
    competitorScore = 0.3; // Terlalu sepi, mungkin tidak ada demand
  } else if (competitorCount <= optimalCompetitorCount) {
    competitorScore = 0.7 + (competitorCount / optimalCompetitorCount) * 0.3;
  } else {
    // Terlalu banyak kompetitor, score menurun
    const excess = competitorCount - optimalCompetitorCount;
    competitorScore = Math.max(0.2, 1.0 - (excess * 0.1));
  }

  // Wisata: semakin dekat semakin baik (dalam 1km = score tinggi)
  const wisataScore = Math.max(0, 1 - (avgWisataDistance / searchRadius));

  // Pelatihan: semakin dekat semakin baik
  const pelatihanScore = Math.max(0, 1 - (avgPelatihanDistance / searchRadius));

  // 5. Hitung total weighted score (0-100)
  const totalScore = (
    competitorScore * competitorWeight +
    wisataScore * wisataWeight +
    pelatihanScore * pelatihanWeight
  ) * 100;

  // 6. Determine rating
  let rating, recommendation;
  if (totalScore >= 75) {
    rating = 'Sangat Potensial';
    recommendation = 'Lokasi ideal untuk UMKM baru! Dekat dengan wisata dan pelatihan, kompetisi sehat.';
  } else if (totalScore >= 60) {
    rating = 'Potensial';
    recommendation = 'Lokasi bagus untuk UMKM. Pertimbangkan diferensiasi produk untuk bersaing.';
  } else if (totalScore >= 40) {
    rating = 'Cukup Potensial';
    recommendation = 'Lokasi memiliki potensi sedang. Perlu strategi marketing yang kuat.';
  } else {
    rating = 'Kurang Potensial';
    recommendation = 'Lokasi kurang ideal. Pertimbangkan lokasi lain atau niche market yang spesifik.';
  }

  return {
    location,
    score: Math.round(totalScore * 10) / 10,
    rating,
    recommendation,
    details: {
      competitors: {
        count: competitorCount,
        score: Math.round(competitorScore * 100),
        list: competitors.slice(0, 10).map(c => ({
          name: c.name,
          category: c.category,
          distance: Math.round(calculateDistance(location.lat, location.lng, c.lat, c.lon) * 1000) / 1000
        }))
      },
      wisata: {
        avgDistance: Math.round(avgWisataDistance * 1000) / 1000,
        score: Math.round(wisataScore * 100),
        nearest: nearestWisata.slice(0, 3).map(w => ({
          name: w.name,
          distance: Math.round(w.distance * 1000) / 1000
        }))
      },
      pelatihan: {
        avgDistance: Math.round(avgPelatihanDistance * 1000) / 1000,
        score: Math.round(pelatihanScore * 100),
        nearest: nearestPelatihan.slice(0, 3).map(p => ({
          name: p.name,
          distance: Math.round(p.distance * 1000) / 1000
        }))
      }
    }
  };
}

/**
 * Generate grid points untuk area scanning
 * @param {Object} bounds - {north, south, east, west}
 * @param {number} gridSize - Grid spacing in km
 * @returns {Array} Array of {lat, lng, name} points
 */
export function generateGridPoints(bounds, gridSize = 0.5) {
  const points = [];
  const latStep = gridSize / 111; // 1 degree lat ≈ 111 km
  const lngStep = gridSize / (111 * Math.cos(bounds.north * Math.PI / 180));

  let pointId = 1;
  for (let lat = bounds.south; lat <= bounds.north; lat += latStep) {
    for (let lng = bounds.west; lng <= bounds.east; lng += lngStep) {
      points.push({
        lat: Math.round(lat * 100000) / 100000,
        lng: Math.round(lng * 100000) / 100000,
        name: `Point ${pointId++}`
      });
    }
  }

  return points;
}

/**
 * Find top potential locations dalam area
 * @param {Array} umkmData
 * @param {Array} wisataData
 * @param {Array} pelatihanData
 * @param {Object} options
 * @returns {Array} Top locations sorted by score
 */
export function findPotentialLocations(umkmData, wisataData, pelatihanData, options = {}) {
  const {
    bounds = null, // Auto-detect dari data jika null
    gridSize = 0.5,
    topN = 10,
    minScore = 50
  } = options;

  // Auto-detect bounds dari data jika tidak disediakan
  let searchBounds = bounds;
  if (!bounds) {
    const allPoints = [...umkmData, ...wisataData, ...pelatihanData];
    if (allPoints.length === 0) return [];

    const lats = allPoints.map(p => p.lat);
    const lngs = allPoints.map(p => p.lon);
    
    searchBounds = {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs)
    };

    // Add padding 10%
    const latPadding = (searchBounds.north - searchBounds.south) * 0.1;
    const lngPadding = (searchBounds.east - searchBounds.west) * 0.1;
    searchBounds.north += latPadding;
    searchBounds.south -= latPadding;
    searchBounds.east += lngPadding;
    searchBounds.west -= lngPadding;
  }

  // Generate grid points
  const gridPoints = generateGridPoints(searchBounds, gridSize);

  // Calculate potential untuk setiap point
  const scoredLocations = gridPoints.map(point => 
    calculateLocationPotential(point, umkmData, wisataData, pelatihanData, options)
  );

  // Filter dan sort
  return scoredLocations
    .filter(loc => loc.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

/**
 * Analyze specific location yang dipilih user
 * @param {number} lat
 * @param {number} lng
 * @param {Array} umkmData
 * @param {Array} wisataData
 * @param {Array} pelatihanData
 * @param {Object} options
 * @returns {Object} Analysis result
 */
export function analyzeSpecificLocation(lat, lng, umkmData, wisataData, pelatihanData, options = {}) {
  const location = {
    lat,
    lng,
    name: 'Selected Location'
  };

  return calculateLocationPotential(location, umkmData, wisataData, pelatihanData, options);
}
