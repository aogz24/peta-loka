import { kmeans } from "ml-kmeans";

/**
 * Service untuk clustering data UMKM
 */
export class ClusteringService {
  /**
   * Melakukan clustering berdasarkan lokasi geografis
   */
  clusterByLocation(data, numClusters = 5) {
    if (!data || data.length === 0) {
      return { clusters: [], centroids: [] };
    }

    // Prepare data untuk clustering (lat, lon)
    const points = data.map((item) => [item.lat, item.lon]);

    // Lakukan K-means clustering
    const result = kmeans(points, numClusters, {
      initialization: "kmeans++",
      maxIterations: 100,
    });

    // Assign cluster ke setiap data point
    const clusteredData = data.map((item, index) => ({
      ...item,
      cluster: result.clusters[index],
      centroid: {
        lat: result.centroids[result.clusters[index]][0],
        lon: result.centroids[result.clusters[index]][1],
      },
    }));

    return {
      clusters: this.groupByCluster(clusteredData),
      centroids: result.centroids.map((c, index) => ({
        id: index,
        lat: c[0],
        lon: c[1],
      })),
      data: clusteredData,
    };
  }

  /**
   * Clustering produk lokal unggulan berdasarkan kategori dan lokasi
   */
  clusterProdukUnggulan(umkmData, numClusters = 5) {
    if (!umkmData || umkmData.length === 0) {
      return { clusters: [], analysis: {} };
    }

    // Filter hanya UMKM yang memiliki kategori produk
    const produkData = umkmData.filter(
      (item) => item.category && item.category !== "lainnya"
    );

    // Clustering berdasarkan lokasi
    const locationClusters = this.clusterByLocation(produkData, numClusters);

    // Analisis kategori per cluster
    const analysis = locationClusters.clusters.map((cluster) => {
      const categories = cluster.items.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {});

      const dominantCategory = Object.keys(categories).reduce((a, b) =>
        categories[a] > categories[b] ? a : b
      );

      return {
        clusterId: cluster.id,
        center: cluster.centroid,
        totalItems: cluster.items.length,
        categories,
        dominantCategory,
        items: cluster.items,
      };
    });

    return {
      clusters: locationClusters.clusters,
      centroids: locationClusters.centroids,
      analysis,
      totalClusters: numClusters,
    };
  }

  /**
   * Mencari tempat pelatihan terdekat untuk setiap cluster UMKM
   */
  findNearestTraining(umkmClusters, pelatihanData) {
    if (!umkmClusters || !pelatihanData || pelatihanData.length === 0) {
      return [];
    }

    return umkmClusters.map((cluster) => {
      const centroid = cluster.centroid;

      // Cari pelatihan terdekat dari centroid cluster
      const nearestTraining = pelatihanData
        .map((pelatihan) => ({
          ...pelatihan,
          distance: this.calculateDistance(
            centroid.lat,
            centroid.lon,
            pelatihan.lat,
            pelatihan.lon
          ),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3); // Top 3 terdekat

      return {
        clusterId: cluster.id,
        centroid,
        totalUMKM: cluster.items.length,
        nearestTraining,
      };
    });
  }

  /**
   * Clustering wisata mikro untuk identifikasi potensi
   */
  clusterWisataMikro(wisataData, numClusters = 5) {
    if (!wisataData || wisataData.length === 0) {
      return { clusters: [], analysis: {} };
    }

    const locationClusters = this.clusterByLocation(wisataData, numClusters);

    // Analisis potensi per cluster
    const analysis = locationClusters.clusters.map((cluster) => {
      const categories = cluster.items.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {});

      return {
        clusterId: cluster.id,
        center: cluster.centroid,
        totalWisata: cluster.items.length,
        categories,
        potensi: this.calculatePotensiWisata(cluster.items),
        items: cluster.items,
      };
    });

    return {
      clusters: locationClusters.clusters,
      centroids: locationClusters.centroids,
      analysis,
      totalClusters: numClusters,
    };
  }

  /**
   * Analisis komprehensif untuk semua data
   */
  analyzeAll(umkmData, wisataData, pelatihanData, numClusters = 5) {
    const produkUnggulan = this.clusterProdukUnggulan(umkmData, numClusters);
    const wisataMikro = this.clusterWisataMikro(wisataData, numClusters);
    const trainingRecommendations = this.findNearestTraining(
      produkUnggulan.clusters,
      pelatihanData
    );

    // Gabungkan semua data untuk overview
    const overallClusters = this.clusterByLocation(
      [...umkmData, ...wisataData],
      numClusters
    );

    return {
      produkUnggulan,
      wisataMikro,
      trainingRecommendations,
      overallClusters,
      summary: {
        totalUMKM: umkmData.length,
        totalWisata: wisataData.length,
        totalPelatihan: pelatihanData.length,
        totalClusters: numClusters,
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
   * Calculate potensi wisata berdasarkan kategori
   */
  calculatePotensiWisata(items) {
    const score = items.length * 10; // Base score

    // Bonus untuk diversity
    const uniqueCategories = new Set(items.map((i) => i.category)).size;
    const diversityBonus = uniqueCategories * 5;

    // Kategorisasi potensi
    const totalScore = score + diversityBonus;

    if (totalScore >= 100) return "Sangat Tinggi";
    if (totalScore >= 70) return "Tinggi";
    if (totalScore >= 40) return "Sedang";
    return "Rendah";
  }
}

export default new ClusteringService();
