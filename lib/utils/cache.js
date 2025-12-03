/**
 * Simple in-memory cache utility with TTL support
 * Untuk mengurangi beban clustering dan scraping yang berulang
 */

class CacheManager {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Generate cache key from parameters
   */
  generateKey(prefix, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}:${JSON.stringify(params[key])}`)
      .join("|");
    return `${prefix}:${sortedParams}`;
  }

  /**
   * Set cache with TTL (time to live)
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds (default: 5 minutes)
   */
  set(key, value, ttl = 5 * 60 * 1000) {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, {
      value,
      expiresAt,
    });
  }

  /**
   * Get cached value
   * @param {string} key - Cache key
   * @returns {any|null} - Cached value or null if not found/expired
   */
  get(key) {
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    // Check if expired
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return cached.value;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Clear specific cache key
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let activeCount = 0;
    let expiredCount = 0;

    for (const [, value] of this.cache.entries()) {
      if (now > value.expiresAt) {
        expiredCount++;
      } else {
        activeCount++;
      }
    }

    return {
      total: this.cache.size,
      active: activeCount,
      expired: expiredCount,
    };
  }
}

// Singleton instance
const cacheManager = new CacheManager();

// Auto-cleanup expired entries every 10 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    cacheManager.clearExpired();
  }, 10 * 60 * 1000);
}

export default cacheManager;
