import { kmeans } from "ml-kmeans";

/**
 * Service untuk clustering data Pelatihan, UMKM, dan Wisata
 */
export class ClusteringService {
  /**
   * Melakukan clustering berdasarkan lokasi geografis
   */
  clusterByLocation(data, numClusters = 5) {
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

    // Prepare data untuk clustering (lat, lon)
    const points = validData.map((item) => [item.lat, item.lon]);

    // Lakukan K-means clustering
    const result = kmeans(points, numClusters, {
      initialization: "kmeans++",
      maxIterations: 100,
    });

    // Assign cluster ke setiap data point
    const clusteredData = validData.map((item, index) => ({
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
   * Clustering UMKM berdasarkan kategori dan lokasi
   */
  clusterUMKM(umkmData, numClusters = 5) {
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
          percentage: Math.round(
            ((withAddress + withPhone + withWebsite) /
              (cluster.items.length * 3)) *
              100
          ),
        },
        items: cluster.items,
      };
    });

    return {
      clusters: locationClusters.clusters,
      centroids: locationClusters.centroids,
      analysis,
      totalClusters: numClusters,
      totalUMKM: validUMKM.length,
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
  clusterWisata(wisataData, numClusters = 5) {
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
      const withOpeningHours = cluster.items.filter(
        (i) => i.openingHours
      ).length;
      const withPhone = cluster.items.filter((i) => i.phone).length;
      const withWebsite = cluster.items.filter((i) => i.website).length;

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
          withOpeningHours,
          withPhone,
          withWebsite,
          percentage: Math.round(
            ((withOpeningHours + withPhone + withWebsite) /
              (cluster.items.length * 3)) *
              100
          ),
        },
        items: cluster.items,
      };
    });

    return {
      clusters: locationClusters.clusters,
      centroids: locationClusters.centroids,
      analysis,
      totalClusters: numClusters,
      totalWisata: validWisata.length,
    };
  }

  /**
   * Clustering pelatihan untuk identifikasi sebaran
   */
  clusterPelatihan(pelatihanData, numClusters = 5) {
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
      totalClusters: numClusters,
      totalPelatihan: validPelatihan.length,
    };
  }

  /**
   * Analisis komprehensif untuk semua data
   */
  analyzeAll(umkmData, wisataData, pelatihanData, numClusters = 5) {
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
   * Calculate potensi wisata berdasarkan jumlah dan kategori
   */
  calculatePotensiWisata(items) {
    const score = items.length * 10; // Base score

    // Bonus untuk diversity
    const uniqueCategories = new Set(items.map((i) => i.category || "lainnya"))
      .size;
    const diversityBonus = uniqueCategories * 5;

    // Bonus untuk kelengkapan data
    const completeData = items.filter(
      (i) => i.address || i.phone || i.website
    ).length;
    const completenessBonus = (completeData / items.length) * 20;

    // Kategorisasi potensi
    const totalScore = score + diversityBonus + completenessBonus;

    if (totalScore >= 100) return "Sangat Tinggi";
    if (totalScore >= 70) return "Tinggi";
    if (totalScore >= 40) return "Sedang";
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
