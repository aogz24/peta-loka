/**
 * Competitor Analysis Service
 * Analisis kompetitor dalam radius tertentu untuk UMKM
 */

import { calculateDistance } from '../utils/distance';

/**
 * Analisis kompetitor dalam radius tertentu
 * @param {Object} targetLocation - {lat, lng, category}
 * @param {Array} umkmData - Semua data UMKM
 * @param {Object} options - Config options
 * @returns {Object} Competitor analysis result
 */
export function analyzeCompetitors(targetLocation, umkmData, options = {}) {
  const {
    radius = 1.0, // km
    includeAllCategories = false, // false = hanya kategori sama
    maxCompetitors = 50,
  } = options;

  // 1. Filter kompetitor dalam radius
  const competitorsInRadius = umkmData
    .map((umkm) => ({
      ...umkm,
      distance: calculateDistance(targetLocation.lat, targetLocation.lng, umkm.lat, umkm.lon),
    }))
    .filter((umkm) => umkm.distance <= radius)
    .filter((umkm) => includeAllCategories || umkm.category === targetLocation.category)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxCompetitors);

  // 2. Group by category
  const byCategory = competitorsInRadius.reduce((acc, comp) => {
    const cat = comp.category || 'Uncategorized';
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(comp);
    return acc;
  }, {});

  // 3. Calculate density zones (0-0.3km, 0.3-0.7km, 0.7-1km+)
  const densityZones = {
    veryClose: competitorsInRadius.filter((c) => c.distance <= 0.3).length,
    close: competitorsInRadius.filter((c) => c.distance > 0.3 && c.distance <= 0.7).length,
    moderate: competitorsInRadius.filter((c) => c.distance > 0.7).length,
  };

  // 4. Market saturation analysis
  const totalCompetitors = competitorsInRadius.length;
  let saturationLevel, saturationDescription;

  if (totalCompetitors === 0) {
    saturationLevel = 'Very Low';
    saturationDescription = 'Tidak ada kompetitor langsung. Bisa jadi peluang atau warning (tidak ada demand).';
  } else if (totalCompetitors <= 3) {
    saturationLevel = 'Low';
    saturationDescription = 'Kompetisi rendah. Peluang bagus untuk masuk pasar dengan diferensiasi yang jelas.';
  } else if (totalCompetitors <= 8) {
    saturationLevel = 'Moderate';
    saturationDescription = 'Kompetisi sedang. Pasar sudah established, perlu unique value proposition.';
  } else if (totalCompetitors <= 15) {
    saturationLevel = 'High';
    saturationDescription = 'Kompetisi tinggi. Perlu strategi marketing agresif dan diferensiasi kuat.';
  } else {
    saturationLevel = 'Very High';
    saturationDescription = 'Pasar sangat kompetitif. Pertimbangkan lokasi lain atau niche market sangat spesifik.';
  }

  // 5. Competition intensity score (0-100)
  // Berdasarkan jumlah dan proximity
  const proximityFactor = (densityZones.veryClose * 3 + densityZones.close * 2 + densityZones.moderate * 1) / Math.max(1, totalCompetitors);

  const intensityScore = Math.min(100, totalCompetitors * 5 + proximityFactor * 20);

  // 6. Strategic recommendations
  const recommendations = generateCompetitorRecommendations(totalCompetitors, densityZones, byCategory, targetLocation.category);

  // 7. Market opportunity score (inverse of intensity)
  const opportunityScore = Math.max(0, 100 - intensityScore);

  return {
    summary: {
      totalCompetitors,
      radius,
      category: targetLocation.category,
      saturationLevel,
      saturationDescription,
      intensityScore: Math.round(intensityScore),
      opportunityScore: Math.round(opportunityScore),
    },
    densityZones,
    byCategory: Object.entries(byCategory)
      .map(([category, competitors]) => ({
        category,
        count: competitors.length,
        percentage: Math.round((competitors.length / totalCompetitors) * 100),
        nearest: competitors[0]?.name || 'N/A',
        nearestDistance: competitors[0]?.distance ? Math.round(competitors[0].distance * 1000) / 1000 : 0,
      }))
      .sort((a, b) => b.count - a.count),
    topCompetitors: competitorsInRadius.slice(0, 10).map((comp) => ({
      name: comp.name,
      category: comp.category,
      distance: Math.round(comp.distance * 1000) / 1000,
      address: comp.address || 'N/A',
      lat: comp.lat,
      lon: comp.lon,
      source: 'umkm',
    })),
    recommendations,
  };
}

/**
 * Generate strategic recommendations
 */
function generateCompetitorRecommendations(totalCompetitors, densityZones, byCategory, targetCategory) {
  const recommendations = [];

  // Proximity recommendations
  if (densityZones.veryClose > 3) {
    recommendations.push({
      type: 'warning',
      title: 'High Proximity Competition',
      description: `${densityZones.veryClose} kompetitor dalam radius 300m. Pertimbangkan diferensiasi produk yang kuat atau lokasi alternatif.`,
    });
  } else if (densityZones.veryClose === 0 && totalCompetitors > 0) {
    recommendations.push({
      type: 'opportunity',
      title: 'Strategic Distance',
      description: 'Tidak ada kompetitor sangat dekat, tapi ada di area sekitar. Posisi strategis untuk menarik customer.',
    });
  }

  // Category recommendations
  const categories = Object.keys(byCategory);
  if (categories.length > 3) {
    recommendations.push({
      type: 'insight',
      title: 'Diverse Market',
      description: `Area ini memiliki ${categories.length} kategori UMKM berbeda. Market yang beragam menandakan area ramai dengan traffic tinggi.`,
    });
  }

  // Saturation recommendations
  if (totalCompetitors === 0) {
    recommendations.push({
      type: 'warning',
      title: 'Zero Competition Alert',
      description: 'Tidak ada kompetitor mungkin berarti tidak ada demand. Lakukan riset pasar mendalam sebelum membuka usaha.',
    });
  } else if (totalCompetitors >= 1 && totalCompetitors <= 5) {
    recommendations.push({
      type: 'opportunity',
      title: 'Healthy Competition',
      description: 'Jumlah kompetitor ideal. Ada demand yang terbukti tanpa saturasi berlebihan.',
    });
  }

  // Category-specific recommendations
  if (byCategory[targetCategory]) {
    const sameCategory = byCategory[targetCategory].length;
    if (sameCategory > 5) {
      recommendations.push({
        type: 'strategy',
        title: 'Differentiation Required',
        description: `${sameCategory} kompetitor dengan kategori sama. Fokus pada unique selling point seperti kualitas premium, harga kompetitif, atau layanan istimewa.`,
      });
    }
  }

  return recommendations;
}

/**
 * Compare dua lokasi untuk analisis kompetitor
 * @param {Object} location1
 * @param {Object} location2
 * @param {Array} umkmData
 * @param {Object} options
 * @returns {Object} Comparison result
 */
export function compareLocations(location1, location2, umkmData, options = {}) {
  const analysis1 = analyzeCompetitors(location1, umkmData, options);
  const analysis2 = analyzeCompetitors(location2, umkmData, options);

  const comparison = {
    location1: {
      ...location1,
      analysis: analysis1,
    },
    location2: {
      ...location2,
      analysis: analysis2,
    },
    winner: null,
    comparison: {
      competitors: {
        location1: analysis1.summary.totalCompetitors,
        location2: analysis2.summary.totalCompetitors,
        winner: analysis1.summary.totalCompetitors < analysis2.summary.totalCompetitors ? 'location1' : 'location2',
      },
      opportunity: {
        location1: analysis1.summary.opportunityScore,
        location2: analysis2.summary.opportunityScore,
        winner: analysis1.summary.opportunityScore > analysis2.summary.opportunityScore ? 'location1' : 'location2',
      },
      intensity: {
        location1: analysis1.summary.intensityScore,
        location2: analysis2.summary.intensityScore,
        winner: analysis1.summary.intensityScore < analysis2.summary.intensityScore ? 'location1' : 'location2',
      },
    },
  };

  // Determine overall winner (2 out of 3)
  const wins = {
    location1: 0,
    location2: 0,
  };

  Object.values(comparison.comparison).forEach((metric) => {
    wins[metric.winner]++;
  });

  comparison.winner = wins.location1 > wins.location2 ? 'location1' : 'location2';
  comparison.recommendation =
    wins.location1 > wins.location2
      ? `Lokasi 1 lebih unggul dengan skor opportunity ${analysis1.summary.opportunityScore} vs ${analysis2.summary.opportunityScore}`
      : `Lokasi 2 lebih unggul dengan skor opportunity ${analysis2.summary.opportunityScore} vs ${analysis1.summary.opportunityScore}`;

  return comparison;
}

/**
 * Get market gap analysis - kategori yang belum ada/sedikit kompetitor
 * @param {Object} targetLocation
 * @param {Array} umkmData
 * @param {Array} allCategories - List semua kategori yang ada
 * @param {Object} options
 * @returns {Array} Gap analysis
 */
export function findMarketGaps(targetLocation, umkmData, allCategories = [], options = {}) {
  const { radius = 1.0 } = options;

  // Get existing categories dalam radius
  const existingAnalysis = analyzeCompetitors(targetLocation, umkmData, {
    ...options,
    includeAllCategories: true,
  });

  const existingCategories = existingAnalysis.byCategory.map((cat) => cat.category);
  const categoryCounts = existingAnalysis.byCategory.reduce((acc, cat) => {
    acc[cat.category] = cat.count;
    return acc;
  }, {});

  // Find gaps
  const gaps = allCategories
    .map((category) => {
      const count = categoryCounts[category] || 0;
      let opportunity;

      if (count === 0) {
        opportunity = 'High - No competition';
      } else if (count <= 2) {
        opportunity = 'Medium - Low competition';
      } else if (count <= 5) {
        opportunity = 'Low - Moderate competition';
      } else {
        opportunity = 'Very Low - High competition';
      }

      return {
        category,
        competitorCount: count,
        opportunity,
        score: Math.max(0, 100 - count * 15),
      };
    })
    .sort((a, b) => b.score - a.score);

  return {
    location: targetLocation,
    radius,
    gaps,
    topOpportunities: gaps.filter((g) => g.score >= 70).slice(0, 5),
  };
}
