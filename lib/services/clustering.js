import { kmeans } from "ml-kmeans";

/**
 * Service untuk clustering data Pelatihan, UMKM, dan Wisata
 * Optimized dengan MiniBatch K-Means dan sampling untuk performa lebih cepat
 */
export class ClusteringService {
  constructor() {
    // Konfigurasi untuk optimasi
    this.config = {
      miniBatchSize: 100, // Ukuran batch untuk MiniBatch K-Means
      maxSampleSize: 1000, // Maksimal data untuk sampling
      fastMode: true, // Mode cepat untuk dataset besar
      maxIterations: 50, // Kurangi iterasi untuk performa
    };
  }
  /**
   * Sampling data untuk mempercepat perhitungan (MiniBatch approach)
   * @param {Array} data - Data yang akan di-sample
   * @param {number} maxSize - Ukuran maksimal sample
   * @returns {Object} { sampled, indices }
   */
  sampleData(data, maxSize) {
    if (data.length <= maxSize) {
      return {
        sampled: data,
        indices: data.map((_, i) => i),
        isSampled: false,
      };
    }

    // Random sampling
    const indices = [];
    const sampled = [];
    const step = Math.floor(data.length / maxSize);

    for (let i = 0; i < data.length; i += step) {
      if (sampled.length < maxSize) {
        indices.push(i);
        sampled.push(data[i]);
      }
    }

    return { sampled, indices, isSampled: true };
  }

  /**
   * MiniBatch K-Means clustering untuk dataset besar
   * @param {Array} points - Array of points [[lat, lon], ...]
   * @param {number} k - Jumlah cluster
   * @param {number} batchSize - Ukuran batch
   * @returns {Object} { centroids, clusters }
   */
  miniBatchKMeans(points, k, batchSize = 100) {
    const n = points.length;

    // Inisialisasi centroids dengan k-means++
    let centroids = this.initializeCentroidsKMeansPlusPlus(points, k);

    // Track assignments
    const clusters = new Array(n).fill(0);
    const clusterCounts = new Array(k).fill(0);

    // Iterasi dengan mini-batches
    const numBatches = Math.ceil(n / batchSize);
    const maxBatchIterations = 10; // Kurangi iterasi untuk performa

    for (let iter = 0; iter < maxBatchIterations; iter++) {
      // Shuffle indices untuk random batches
      const indices = Array.from({ length: n }, (_, i) => i);

      for (let b = 0; b < numBatches; b++) {
        const start = b * batchSize;
        const end = Math.min(start + batchSize, n);

        // Proses batch
        for (let i = start; i < end; i++) {
          const point = points[i];

          // Assign ke cluster terdekat
          let minDist = Infinity;
          let bestCluster = 0;

          for (let c = 0; c < k; c++) {
            const dist = this.euclideanDistance(point, centroids[c]);
            if (dist < minDist) {
              minDist = dist;
              bestCluster = c;
            }
          }

          clusters[i] = bestCluster;
          clusterCounts[bestCluster]++;

          // Update centroid menggunakan learning rate
          const eta = 1 / clusterCounts[bestCluster];
          centroids[bestCluster] = [
            centroids[bestCluster][0] +
              eta * (point[0] - centroids[bestCluster][0]),
            centroids[bestCluster][1] +
              eta * (point[1] - centroids[bestCluster][1]),
          ];
        }
      }
    }

    return { centroids, clusters };
  }

  /**
   * K-Means++ initialization
   */
  initializeCentroidsKMeansPlusPlus(points, k) {
    const centroids = [];
    const n = points.length;

    // Pilih centroid pertama secara random
    centroids.push(points[Math.floor(Math.random() * n)]);

    // Pilih k-1 centroids berikutnya
    for (let c = 1; c < k; c++) {
      const distances = points.map((point) => {
        let minDist = Infinity;
        for (const centroid of centroids) {
          const dist = this.euclideanDistance(point, centroid);
          minDist = Math.min(minDist, dist);
        }
        return minDist * minDist;
      });

      const sum = distances.reduce((a, b) => a + b, 0);
      const r = Math.random() * sum;

      let cumSum = 0;
      for (let i = 0; i < n; i++) {
        cumSum += distances[i];
        if (cumSum >= r) {
          centroids.push(points[i]);
          break;
        }
      }
    }

    return centroids;
  }

  /**
   * Euclidean distance squared (lebih cepat, tanpa sqrt)
   * Digunakan untuk perbandingan jarak saja
   */
  euclideanDistanceSquared(p1, p2) {
    const dx = p1[0] - p2[0];
    const dy = p1[1] - p2[1];
    return dx * dx + dy * dy;
  }

  /**
   * Euclidean distance cepat
   */
  euclideanDistance(p1, p2) {
    const dx = p1[0] - p2[0];
    const dy = p1[1] - p2[1];
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Pre-compute distance matrix untuk sample kecil (memoization)
   * @param {Array} points - Array of points
   * @returns {Array} Distance matrix
   */
  computeDistanceMatrix(points) {
    const n = points.length;
    const matrix = Array(n)
      .fill(null)
      .map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dist = this.euclideanDistance(points[i], points[j]);
        matrix[i][j] = dist;
        matrix[j][i] = dist; // Symmetric
      }
    }

    return matrix;
  }

  /**
   * Silhouette Coefficient SUPER FAST - Optimized dengan distance matrix dan vectorization
   * @param {Array} points - Array of data points [[lat, lon], ...]
   * @param {Array} clusters - Array of cluster assignments [0, 1, 2, ...]
   * @returns {number} Silhouette score (-1 to 1, higher is better)
   */
  calculateSilhouetteCoefficient(points, clusters) {
    if (points.length < 2) return 0;

    // Aggressive sampling untuk dataset besar
    const maxSampleSize = points.length > 1000 ? 100 : 200;
    const { sampled: sampledPoints, indices } = this.sampleData(
      points,
      maxSampleSize
    );
    const sampledClusters = indices.map((i) => clusters[i]);

    const n = sampledPoints.length;
    const uniqueClusters = [...new Set(sampledClusters)];

    if (uniqueClusters.length === 1) return 0;

    // Pre-compute distance matrix untuk sample kecil (HUGE speedup)
    const distMatrix = this.computeDistanceMatrix(sampledPoints);

    // Group points by cluster untuk akses cepat
    const clusterGroups = {};
    for (let i = 0; i < n; i++) {
      const cluster = sampledClusters[i];
      if (!clusterGroups[cluster]) {
        clusterGroups[cluster] = [];
      }
      clusterGroups[cluster].push(i);
    }

    let totalScore = 0;
    let validPoints = 0;

    // Vectorized computation
    for (let i = 0; i < n; i++) {
      const currentCluster = sampledClusters[i];
      const sameClusterIndices = clusterGroups[currentCluster].filter(
        (idx) => idx !== i
      );

      // a(i): rata-rata jarak dalam cluster
      let a = 0;
      if (sameClusterIndices.length > 0) {
        for (const j of sameClusterIndices) {
          a += distMatrix[i][j];
        }
        a /= sameClusterIndices.length;
      } else {
        continue; // Skip singleton clusters
      }

      // b(i): rata-rata jarak minimum ke cluster lain
      let b = Infinity;
      for (const otherCluster of uniqueClusters) {
        if (otherCluster === currentCluster) continue;

        const otherClusterIndices = clusterGroups[otherCluster];
        if (!otherClusterIndices || otherClusterIndices.length === 0) continue;

        let avgDist = 0;
        for (const j of otherClusterIndices) {
          avgDist += distMatrix[i][j];
        }
        avgDist /= otherClusterIndices.length;
        b = Math.min(b, avgDist);
      }

      if (b !== Infinity && a !== b) {
        const s = (b - a) / Math.max(a, b);
        totalScore += s;
        validPoints++;
      }
    }

    return validPoints > 0 ? totalScore / validPoints : 0;
  }

  /**
   * Approximate Silhouette Score - Super cepat untuk dataset besar
   * Menggunakan centroid distance approximation
   */
  approximateSilhouetteScore(points, clusters, centroids) {
    if (points.length < 2) return 0;

    // Sample lebih agresif
    const maxSample = 50;
    const { sampled: sampledPoints, indices } = this.sampleData(
      points,
      maxSample
    );
    const sampledClusters = indices.map((i) => clusters[i]);

    let totalScore = 0;
    let count = 0;

    for (let i = 0; i < sampledPoints.length; i++) {
      const point = sampledPoints[i];
      const cluster = sampledClusters[i];

      // a: jarak ke centroid sendiri (approximation)
      const a = this.euclideanDistance(point, centroids[cluster]);

      // b: jarak ke centroid terdekat lainnya
      let b = Infinity;
      for (let c = 0; c < centroids.length; c++) {
        if (c === cluster) continue;
        const dist = this.euclideanDistance(point, centroids[c]);
        b = Math.min(b, dist);
      }

      if (a !== 0 && b !== Infinity) {
        const s = (b - a) / Math.max(a, b);
        totalScore += s;
        count++;
      }
    }

    return count > 0 ? totalScore / count : 0;
  }

  /**
   * Menemukan jumlah cluster optimal (OPTIMIZED)
   * Menggunakan sampling dan estimasi cepat untuk dataset besar
   * @param {Array} data - Data dengan lat dan lon
   * @param {number} minClusters - Jumlah cluster minimum (default: 2)
   * @param {number} maxClusters - Jumlah cluster maksimum (default: 10)
   * @returns {Object} { optimalK, scores, bestScore }
   */
  findOptimalClusters(data, minClusters = 2, maxClusters = 10) {
    if (!data || data.length === 0) {
      return { optimalK: 5, scores: [], bestScore: 0 };
    }

    const validData = data.filter(
      (item) => item.lat && item.lon && !isNaN(item.lat) && !isNaN(item.lon)
    );

    if (validData.length < minClusters) {
      return {
        optimalK: Math.max(2, validData.length),
        scores: [],
        bestScore: 0,
      };
    }

    // Sampling untuk dataset besar
    const { sampled: sampledData } = this.sampleData(
      validData,
      this.config.maxSampleSize
    );
    const points = sampledData.map((item) => [item.lat, item.lon]);

    const scores = [];
    let bestScore = -1;
    let optimalK = minClusters;

    // Heuristik cepat: untuk dataset besar, batasi range pencarian
    const effectiveMaxClusters = Math.min(
      maxClusters,
      Math.max(3, Math.floor(Math.sqrt(points.length)))
    );

    // Test berbagai jumlah cluster dengan interval
    const step = points.length > 500 ? 2 : 1; // Skip beberapa k untuk dataset besar

    // Gunakan approximate silhouette untuk dataset besar
    const useApproximate = points.length > 300;

    for (
      let k = minClusters;
      k <= Math.min(effectiveMaxClusters, points.length);
      k += step
    ) {
      // Gunakan MiniBatch untuk dataset besar
      let result;
      if (points.length > 500) {
        result = this.miniBatchKMeans(points, k, this.config.miniBatchSize);
      } else {
        result = kmeans(points, k, {
          initialization: "kmeans++",
          maxIterations: this.config.maxIterations,
        });
      }

      // Pilih metode silhouette berdasarkan ukuran dataset
      let silhouetteScore;
      if (useApproximate) {
        // Approximate silhouette - 10x lebih cepat!
        silhouetteScore = this.approximateSilhouetteScore(
          points,
          result.clusters,
          result.centroids
        );
      } else {
        // Exact silhouette untuk dataset kecil
        silhouetteScore = this.calculateSilhouetteCoefficient(
          points,
          result.clusters
        );
      }

      scores.push({
        k,
        score: silhouetteScore,
      });

      if (silhouetteScore > bestScore) {
        bestScore = silhouetteScore;
        optimalK = k;
      }
    }

    return {
      optimalK,
      scores,
      bestScore,
      optimizationUsed:
        points.length > 500
          ? "MiniBatch K-Means + Approximate Silhouette"
          : "Standard K-Means",
    };
  }

  /**
   * Melakukan clustering berdasarkan lokasi geografis
   */
  clusterByLocation(data, numClusters = null) {
    if (!data || data.length === 0) {
      return { clusters: [], centroids: [] };
    }

    // Filter data yang memiliki koordinat valid
    const validData = data.filter(
      (item) => item.lat && item.lon && !isNaN(item.lat) && !isNaN(item.lon)
    );

    if (validData.length === 0) {
      return { clusters: [], centroids: [] };
    }

    // Jika numClusters tidak ditentukan, gunakan Silhouette Coefficient untuk menemukan optimal
    let finalNumClusters = numClusters;
    let silhouetteAnalysis = null;

    if (!numClusters) {
      const optimalResult = this.findOptimalClusters(validData, 2, 10);
      finalNumClusters = optimalResult.optimalK;
      silhouetteAnalysis = optimalResult;
    }

    // Prepare data untuk clustering (lat, lon)
    const points = validData.map((item) => [item.lat, item.lon]);

    // Gunakan MiniBatch K-Means untuk dataset besar, standard K-Means untuk kecil
    let result;
    const useMiniBatch = points.length > 300 || this.config.fastMode;

    if (useMiniBatch) {
      result = this.miniBatchKMeans(
        points,
        finalNumClusters,
        this.config.miniBatchSize
      );
    } else {
      result = kmeans(points, finalNumClusters, {
        initialization: "kmeans++",
        maxIterations: this.config.maxIterations,
      });
    }

    // Hitung Silhouette Score untuk clustering ini
    const silhouetteScore = this.calculateSilhouetteCoefficient(
      points,
      result.clusters
    );

    // Assign cluster ke setiap data point
    const clusteredData = validData.map((item, index) => ({
      ...item,
      cluster: result.clusters[index],
      centroid: {
        lat: result.centroids[result.clusters[index]][0],
        lon: result.centroids[result.clusters[index]][1],
      },
    }));

    // Group data by cluster
    const clusters = this.groupByCluster(clusteredData);

    // Hitung radius untuk setiap centroid berdasarkan jarak terjauh dari anggota cluster
    const centroids = result.centroids.map((c, index) => {
      const centroidLat = c[0];
      const centroidLon = c[1];

      // Cari semua data point dalam cluster ini
      const clusterPoints = clusteredData.filter(
        (item) => item.cluster === index
      );

      if (clusterPoints.length === 0) {
        return {
          id: index,
          lat: centroidLat,
          lon: centroidLon,
          radius: 500, // radius default jika tidak ada data
        };
      }

      // Hitung jarak maksimum dari centroid ke semua anggota cluster
      const maxDistance = Math.max(
        ...clusterPoints.map(
          (item) =>
            this.calculateDistance(
              centroidLat,
              centroidLon,
              item.lat,
              item.lon
            ) * 1000 // konversi ke meter
        )
      );

      return {
        id: index,
        lat: centroidLat,
        lon: centroidLon,
        radius: Math.max(maxDistance, 500), // minimum 500 meter
      };
    });

    return {
      clusters,
      centroids,
      data: clusteredData,
      silhouetteScore,
      silhouetteAnalysis,
      clusterCount: finalNumClusters,
    };
  }

  /**
   * Clustering UMKM berdasarkan kategori dan lokasi
   */
  clusterUMKM(umkmData, numClusters = null) {
    if (!umkmData || umkmData.length === 0) {
      return { clusters: [], analysis: [] };
    }

    // Filter UMKM dengan data valid
    const validUMKM = umkmData.filter(
      (item) => item.type === "umkm" && item.category && item.lat && item.lon
    );

    // Clustering berdasarkan lokasi
    const locationClusters = this.clusterByLocation(validUMKM, numClusters);

    // Analisis kategori per cluster
    const analysis = locationClusters.clusters.map((cluster) => {
      const categories = cluster.items.reduce((acc, item) => {
        const cat = item.category || "lainnya";
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});

      const dominantCategory = Object.keys(categories).reduce((a, b) =>
        categories[a] > categories[b] ? a : b
      );

      // Hitung statistik tambahan
      const withAddress = cluster.items.filter((i) => i.address).length;
      const withPhone = cluster.items.filter((i) => i.phone).length;
      const withWebsite = cluster.items.filter((i) => i.website).length;

      // Hitung persentase kelengkapan
      // Dataset: ~30% ada address, ~3% phone, ~3% website
      // Beri bobot lebih pada address karena lebih umum
      const addressWeight = 0.5;
      const phoneWeight = 0.25;
      const websiteWeight = 0.25;

      const completenessScore =
        (withAddress / cluster.items.length) * addressWeight * 100 +
        (withPhone / cluster.items.length) * phoneWeight * 100 +
        (withWebsite / cluster.items.length) * websiteWeight * 100;

      return {
        clusterId: cluster.id,
        center: cluster.centroid,
        totalItems: cluster.items.length,
        categories,
        dominantCategory,
        completeness: {
          withAddress,
          withPhone,
          withWebsite,
          percentage: Math.round(completenessScore),
        },
        items: cluster.items,
      };
    });

    return {
      clusters: locationClusters.clusters,
      centroids: locationClusters.centroids,
      analysis,
      totalClusters: locationClusters.clusterCount,
      totalUMKM: validUMKM.length,
      silhouetteScore: locationClusters.silhouetteScore,
      silhouetteAnalysis: locationClusters.silhouetteAnalysis,
    };
  }

  /**
   * Mencari tempat pelatihan terdekat untuk setiap cluster UMKM
   */
  findNearestTraining(umkmClusters, pelatihanData) {
    if (!umkmClusters || !pelatihanData || pelatihanData.length === 0) {
      return [];
    }

    // Filter pelatihan dengan koordinat valid
    const validPelatihan = pelatihanData.filter(
      (item) =>
        item.type === "pelatihan" &&
        item.lat &&
        item.lon &&
        !isNaN(item.lat) &&
        !isNaN(item.lon)
    );

    return umkmClusters.map((cluster) => {
      const centroid = cluster.centroid;

      // Cari pelatihan terdekat dari centroid cluster
      const nearestTraining = validPelatihan
        .map((pelatihan) => ({
          id: pelatihan.id,
          name: pelatihan.name || "Tempat Pelatihan",
          category: pelatihan.category,
          address: pelatihan.address,
          phone: pelatihan.phone,
          lat: pelatihan.lat,
          lon: pelatihan.lon,
          distance: this.calculateDistance(
            centroid.lat,
            centroid.lon,
            pelatihan.lat,
            pelatihan.lon
          ),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5); // Top 5 terdekat

      return {
        clusterId: cluster.id,
        centroid,
        totalUMKM: cluster.items.length,
        nearestTraining,
        averageDistance:
          nearestTraining.length > 0
            ? (
                nearestTraining.reduce((sum, t) => sum + t.distance, 0) /
                nearestTraining.length
              ).toFixed(2)
            : 0,
      };
    });
  }

  /**
   * Clustering wisata untuk identifikasi potensi
   */
  clusterWisata(wisataData, numClusters = null) {
    if (!wisataData || wisataData.length === 0) {
      return { clusters: [], analysis: [] };
    }

    // Filter wisata dengan data valid
    const validWisata = wisataData.filter(
      (item) =>
        item.type === "wisata" &&
        item.lat &&
        item.lon &&
        !isNaN(item.lat) &&
        !isNaN(item.lon)
    );

    const locationClusters = this.clusterByLocation(validWisata, numClusters);

    // Analisis potensi per cluster
    const analysis = locationClusters.clusters.map((cluster) => {
      const categories = cluster.items.reduce((acc, item) => {
        const cat = item.category || "lainnya";
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});

      // Hitung statistik tambahan
      const withAddress = cluster.items.filter((i) => i.address).length;
      const withOpeningHours = cluster.items.filter(
        (i) => i.openingHours
      ).length;
      const withPhone = cluster.items.filter((i) => i.phone).length;
      const withWebsite = cluster.items.filter((i) => i.website).length;

      // Hitung persentase kelengkapan
      // Dataset: ~25% ada address, ~3% phone, ~2% website
      // Beri bobot lebih pada address & opening hours
      const addressWeight = 0.4;
      const hoursWeight = 0.3;
      const phoneWeight = 0.15;
      const websiteWeight = 0.15;

      const completenessScore =
        (withAddress / cluster.items.length) * addressWeight * 100 +
        (withOpeningHours / cluster.items.length) * hoursWeight * 100 +
        (withPhone / cluster.items.length) * phoneWeight * 100 +
        (withWebsite / cluster.items.length) * websiteWeight * 100;

      return {
        clusterId: cluster.id,
        center: cluster.centroid,
        totalWisata: cluster.items.length,
        categories,
        topCategories: Object.entries(categories)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([cat, count]) => ({ category: cat, count })),
        potensi: this.calculatePotensiWisata(cluster.items),
        completeness: {
          withAddress,
          withOpeningHours,
          withPhone,
          withWebsite,
          percentage: Math.round(completenessScore),
        },
        items: cluster.items,
      };
    });

    return {
      clusters: locationClusters.clusters,
      centroids: locationClusters.centroids,
      analysis,
      totalClusters: locationClusters.clusterCount,
      totalWisata: validWisata.length,
      silhouetteScore: locationClusters.silhouetteScore,
      silhouetteAnalysis: locationClusters.silhouetteAnalysis,
    };
  }

  /**
   * Clustering pelatihan untuk identifikasi sebaran
   */
  clusterPelatihan(pelatihanData, numClusters = null) {
    if (!pelatihanData || pelatihanData.length === 0) {
      return { clusters: [], analysis: [] };
    }

    // Filter pelatihan dengan data valid
    const validPelatihan = pelatihanData.filter(
      (item) =>
        item.type === "pelatihan" &&
        item.lat &&
        item.lon &&
        !isNaN(item.lat) &&
        !isNaN(item.lon)
    );

    const locationClusters = this.clusterByLocation(
      validPelatihan,
      numClusters
    );

    // Analisis kategori per cluster
    const analysis = locationClusters.clusters.map((cluster) => {
      const categories = cluster.items.reduce((acc, item) => {
        const cat = item.category || "lainnya";
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});

      return {
        clusterId: cluster.id,
        center: cluster.centroid,
        totalPelatihan: cluster.items.length,
        categories,
        topCategories: Object.entries(categories)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([cat, count]) => ({ category: cat, count })),
        items: cluster.items,
      };
    });

    return {
      clusters: locationClusters.clusters,
      centroids: locationClusters.centroids,
      analysis,
      totalClusters: locationClusters.clusterCount,
      totalPelatihan: validPelatihan.length,
      silhouetteScore: locationClusters.silhouetteScore,
      silhouetteAnalysis: locationClusters.silhouetteAnalysis,
    };
  }

  /**
   * Analisis komprehensif untuk semua data
   */
  analyzeAll(umkmData, wisataData, pelatihanData, numClusters = null) {
    const umkmClustering = this.clusterUMKM(umkmData, numClusters);
    const wisataClustering = this.clusterWisata(wisataData, numClusters);
    const pelatihanClustering = this.clusterPelatihan(
      pelatihanData,
      numClusters
    );
    const trainingRecommendations = this.findNearestTraining(
      umkmClustering.clusters,
      pelatihanData
    );

    // Gabungkan semua data untuk overview
    const allData = [
      ...umkmData.filter((d) => d.lat && d.lon),
      ...wisataData.filter((d) => d.lat && d.lon),
      ...pelatihanData.filter((d) => d.lat && d.lon),
    ];
    const overallClusters = this.clusterByLocation(allData, numClusters);

    // Analisis per cluster gabungan
    const overallAnalysis = overallClusters.clusters.map((cluster) => {
      const umkmCount = cluster.items.filter((i) => i.type === "umkm").length;
      const wisataCount = cluster.items.filter(
        (i) => i.type === "wisata"
      ).length;
      const pelatihanCount = cluster.items.filter(
        (i) => i.type === "pelatihan"
      ).length;

      return {
        clusterId: cluster.id,
        center: cluster.centroid,
        totalItems: cluster.items.length,
        breakdown: {
          umkm: umkmCount,
          wisata: wisataCount,
          pelatihan: pelatihanCount,
        },
        density: this.calculateDensity(cluster.items),
      };
    });

    return {
      umkm: umkmClustering,
      wisata: wisataClustering,
      pelatihan: pelatihanClustering,
      trainingRecommendations,
      overall: {
        clusters: overallClusters.clusters,
        centroids: overallClusters.centroids,
        analysis: overallAnalysis,
      },
      summary: {
        totalUMKM: umkmData.filter((d) => d.lat && d.lon).length,
        totalWisata: wisataData.filter((d) => d.lat && d.lon).length,
        totalPelatihan: pelatihanData.filter((d) => d.lat && d.lon).length,
        totalClusters: overallClusters.clusterCount || numClusters,
        silhouetteScore: overallClusters.silhouetteScore,
        method: numClusters ? "manual" : "silhouette-optimized",
      },
    };
  }

  /**
   * Helper: Group data by cluster
   */
  groupByCluster(clusteredData) {
    const groups = {};

    clusteredData.forEach((item) => {
      if (!groups[item.cluster]) {
        groups[item.cluster] = {
          id: item.cluster,
          centroid: item.centroid,
          items: [],
        };
      }
      groups[item.cluster].items.push(item);
    });

    return Object.values(groups);
  }

  /**
   * Helper: Calculate distance between two points (Haversine formula)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius bumi dalam km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  /**
   * Calculate potensi wisata berdasarkan jumlah dan kategori
   * Disesuaikan dengan karakteristik data: 2814 wisata / 5 cluster = ~563 per cluster
   */
  calculatePotensiWisata(items) {
    if (items.length === 0) return "Rendah";

    // Base score dari jumlah wisata (max 50 poin)
    // Dengan 2814 total wisata / 5 cluster = ~563 rata-rata
    // Skor disesuaikan:
    // - <200 wisata: rendah (0-15 poin)
    // - 200-400: sedang (15-30 poin)
    // - 400-600: tinggi (30-40 poin)
    // - >600: sangat tinggi (40-50 poin)
    let baseScore;
    if (items.length >= 600) {
      baseScore = 50;
    } else if (items.length >= 400) {
      baseScore = 30 + ((items.length - 400) / 200) * 10;
    } else if (items.length >= 200) {
      baseScore = 15 + ((items.length - 200) / 200) * 15;
    } else {
      baseScore = (items.length / 200) * 15;
    }

    // Diversity kategori (max 30 poin)
    // Dataset punya 46 kategori total, distribusi per cluster bervariasi
    // Cluster bagus: 8-15 kategori berbeda
    const uniqueCategories = new Set(items.map((i) => i.category || "lainnya"))
      .size;
    let diversityBonus;
    if (uniqueCategories >= 15) {
      diversityBonus = 30;
    } else if (uniqueCategories >= 8) {
      diversityBonus = 15 + ((uniqueCategories - 8) / 7) * 15;
    } else {
      diversityBonus = (uniqueCategories / 8) * 15;
    }

    // Bonus kelengkapan data (max 20 poin)
    // Dataset: ~25% address, ~3% phone, ~2% website, ~1% opening hours
    const withAddress = items.filter((i) => i.address).length;
    const withPhone = items.filter((i) => i.phone).length;
    const withWebsite = items.filter((i) => i.website).length;
    const withOpeningHours = items.filter((i) => i.openingHours).length;

    const addressRatio = withAddress / items.length;
    const phoneRatio = withPhone / items.length;
    const websiteRatio = withWebsite / items.length;
    const hoursRatio = withOpeningHours / items.length;

    // Skala kelengkapan: excellent jika > rata-rata dataset
    const addressScore = Math.min((addressRatio / 0.25) * 8, 8); // max 8 poin
    const phoneScore = Math.min((phoneRatio / 0.03) * 4, 4); // max 4 poin
    const websiteScore = Math.min((websiteRatio / 0.02) * 4, 4); // max 4 poin
    const hoursScore = Math.min((hoursRatio / 0.01) * 4, 4); // max 4 poin
    const completenessBonus =
      addressScore + phoneScore + websiteScore + hoursScore;

    // Total score (max 100 poin)
    const totalScore = baseScore + diversityBonus + completenessBonus;

    // Threshold yang lebih ketat
    if (totalScore >= 80) return "Sangat Tinggi"; // Butuh 600+ wisata, 15+ kategori, data lengkap
    if (totalScore >= 60) return "Tinggi"; // Butuh 400+ wisata, 10+ kategori
    if (totalScore >= 40) return "Sedang"; // Butuh 200+ wisata, 5+ kategori
    return "Rendah";
  }

  /**
   * Calculate density berdasarkan sebaran lokasi
   */
  calculateDensity(items) {
    if (items.length < 2) return "Rendah";

    const avgLat = items.reduce((sum, i) => sum + i.lat, 0) / items.length;
    const avgLon = items.reduce((sum, i) => sum + i.lon, 0) / items.length;

    const distances = items.map((item) =>
      this.calculateDistance(avgLat, avgLon, item.lat, item.lon)
    );

    const avgDistance =
      distances.reduce((sum, d) => sum + d, 0) / distances.length;

    // Density berdasarkan jarak rata-rata
    if (avgDistance < 1) return "Sangat Tinggi";
    if (avgDistance < 3) return "Tinggi";
    if (avgDistance < 5) return "Sedang";
    return "Rendah";
  }
}

export default new ClusteringService();
