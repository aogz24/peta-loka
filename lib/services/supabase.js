import { supabase } from '../supabase/client';

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
      let query = supabase.from(tableName).select('*');

      // Apply filters if provided
      if (options.category) {
        query = query.eq('category', options.category);
      }

      if (options.type) {
        query = query.eq('type', options.type);
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
    return this.fetchAll('pelatihan', options);
  },

  /**
   * Fetch UMKM data
   * @param {object} options - Query options
   * @returns {Promise<Array>} Array of UMKM data
   */
  async fetchUmkm(options = {}) {
    return this.fetchAll('umkm', options);
  },

  /**
   * Fetch wisata data
   * @param {object} options - Query options
   * @returns {Promise<Array>} Array of wisata data
   */
  async fetchWisata(options = {}) {
    return this.fetchAll('wisata', options);
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
      console.error('Failed to fetch all data types:', error);
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
        .select('*')
        .gte('lat', minLat)
        .lte('lat', maxLat)
        .gte('lon', minLon)
        .lte('lon', maxLon);

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
        .select('*')
        .eq('category', category);

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
        .select('*', { count: 'exact', head: true });

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
};

export default supabaseService;
