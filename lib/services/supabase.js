import { supabase } from "../supabase/client";

/**
 * Service untuk mengambil data dari Supabase
 */
const supabaseService = {
  /**
   * Fetch all data from a specific table
   * @param {string} tableName - Name of the table (pelatihan, umkm, wisata)
   * @param {object} options - Query options
   * @returns {Promise<Array>} Array of data
   */
  async fetchAll(tableName, options = {}) {
    try {
      let query = supabase.from(tableName).select("*");

      // Apply filters if provided
      if (options.category) {
        query = query.eq("category", options.category);
      }

      if (options.type) {
        query = query.eq("type", options.type);
      }

      // Apply limit if provided
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error(`Error fetching ${tableName}:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(`Failed to fetch ${tableName}:`, error);
      throw error;
    }
  },

  /**
   * Fetch pelatihan data
   * @param {object} options - Query options
   * @returns {Promise<Array>} Array of pelatihan data
   */
  async fetchPelatihan(options = {}) {
    return this.fetchAll("pelatihan", options);
  },

  /**
   * Fetch UMKM data
   * @param {object} options - Query options
   * @returns {Promise<Array>} Array of UMKM data
   */
  async fetchUmkm(options = {}) {
    return this.fetchAll("umkm", options);
  },

  /**
   * Fetch wisata data
   * @param {object} options - Query options
   * @returns {Promise<Array>} Array of wisata data
   */
  async fetchWisata(options = {}) {
    return this.fetchAll("wisata", options);
  },

  /**
   * Fetch all data types (pelatihan, umkm, wisata)
   * @param {object} options - Query options
   * @returns {Promise<object>} Object containing all data types
   */
  async fetchAllTypes(options = {}) {
    try {
      const [pelatihan, umkm, wisata] = await Promise.all([
        this.fetchPelatihan(options),
        this.fetchUmkm(options),
        this.fetchWisata(options),
      ]);

      return {
        pelatihan,
        umkm,
        wisata,
      };
    } catch (error) {
      console.error("Failed to fetch all data types:", error);
      throw error;
    }
  },

  /**
   * Fetch data by specific location bounds
   * @param {string} tableName - Name of the table
   * @param {object} bounds - Location bounds {minLat, maxLat, minLon, maxLon}
   * @returns {Promise<Array>} Filtered data
   */
  async fetchByBounds(tableName, bounds) {
    try {
      const { minLat, maxLat, minLon, maxLon } = bounds;

      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .gte("lat", minLat)
        .lte("lat", maxLat)
        .gte("lon", minLon)
        .lte("lon", maxLon);

      if (error) {
        console.error(`Error fetching ${tableName} by bounds:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(`Failed to fetch ${tableName} by bounds:`, error);
      throw error;
    }
  },

  /**
   * Fetch data by category
   * @param {string} tableName - Name of the table
   * @param {string} category - Category to filter
   * @returns {Promise<Array>} Filtered data
   */
  async fetchByCategory(tableName, category) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .eq("category", category);

      if (error) {
        console.error(`Error fetching ${tableName} by category:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(`Failed to fetch ${tableName} by category:`, error);
      throw error;
    }
  },

  /**
   * Get statistics for a table
   * @param {string} tableName - Name of the table
   * @returns {Promise<object>} Statistics
   */
  async getStats(tableName) {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select("*", { count: "exact", head: true });

      if (error) {
        console.error(`Error getting stats for ${tableName}:`, error);
        throw error;
      }

      return { count };
    } catch (error) {
      console.error(`Failed to get stats for ${tableName}:`, error);
      throw error;
    }
  },

  /**
   * Haversine formula untuk menghitung jarak antara dua koordinat
   * @param {number} lat1 - Latitude titik 1
   * @param {number} lon1 - Longitude titik 1
   * @param {number} lat2 - Latitude titik 2
   * @param {number} lon2 - Longitude titik 2
   * @returns {number} Jarak dalam meter
   */
  haversine(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Radius bumi dalam meter
    const toRad = (x) => (x * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  },

  /**
   * Fetch data berdasarkan radius dari koordinat tertentu
   * @param {number} lat - Latitude pusat
   * @param {number} lon - Longitude pusat
   * @param {number} radius - Radius dalam meter (default 5000)
   * @returns {Promise<object>} Object containing filtered data
   */
  async fetchByRadius(lat, lon, radius = 5000) {
    try {
      // Hitung bounding box untuk optimasi query
      // 1 derajat latitude ≈ 111km
      const latOffset = radius / 111000;
      const lonOffset = radius / (111000 * Math.cos((lat * Math.PI) / 180));

      const bounds = {
        minLat: lat - latOffset,
        maxLat: lat + latOffset,
        minLon: lon - lonOffset,
        maxLon: lon + lonOffset,
      };

      // Fetch data dari semua tabel dengan bounds
      const [umkmData, wisataData, pelatihanData] = await Promise.all([
        this.fetchByBounds("umkm", bounds),
        this.fetchByBounds("wisata", bounds),
        this.fetchByBounds("pelatihan", bounds),
      ]);

      // Filter berdasarkan radius sebenarnya menggunakan Haversine
      const umkmFiltered = umkmData.filter((item) => {
        if (!item.lat || !item.lon) return false;
        const distance = this.haversine(lat, lon, item.lat, item.lon);
        return distance <= radius;
      });

      const wisataFiltered = wisataData.filter((item) => {
        if (!item.lat || !item.lon) return false;
        const distance = this.haversine(lat, lon, item.lat, item.lon);
        return distance <= radius;
      });

      const pelatihanFiltered = pelatihanData.filter((item) => {
        if (!item.lat || !item.lon) return false;
        const distance = this.haversine(lat, lon, item.lat, item.lon);
        return distance <= radius;
      });

      return {
        umkm: umkmFiltered,
        wisata: wisataFiltered,
        pelatihan: pelatihanFiltered,
        total:
          umkmFiltered.length +
          wisataFiltered.length +
          pelatihanFiltered.length,
      };
    } catch (error) {
      console.error("Failed to fetch data by radius:", error);
      throw error;
    }
  },
};

export default supabaseService;
