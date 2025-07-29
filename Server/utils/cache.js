/**
 * Simple in-memory cache utility
 * For production, consider using Redis
 */

class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  /**
   * Set a value in cache with optional TTL
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in seconds
   */
  set(key, value, ttl = 300) { // Default 5 minutes
    // Clear existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Set the value
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttl * 1000 // Convert to milliseconds
    });

    // Set expiration timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl * 1000);

    this.timers.set(key, timer);
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {*} Cached value or null if not found/expired
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Delete a value from cache
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.delete(key);
    
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
  }

  /**
   * Clear all cache
   */
  clear() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    
    this.cache.clear();
    this.timers.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @returns {boolean} True if key exists and not expired
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Get or set pattern - if key exists return it, otherwise execute function and cache result
   * @param {string} key - Cache key
   * @param {Function} fn - Function to execute if cache miss
   * @param {number} ttl - Time to live in seconds
   * @returns {*} Cached or computed value
   */
  async getOrSet(key, fn, ttl = 300) {
    let value = this.get(key);
    
    if (value === null) {
      value = await fn();
      this.set(key, value, ttl);
    }
    
    return value;
  }
}

// Create singleton instance
const cache = new MemoryCache();

/**
 * Cache middleware for Express routes
 * @param {number} ttl - Time to live in seconds
 * @returns {Function} Express middleware
 */
const cacheMiddleware = (ttl = 300) => {
  return (req, res, next) => {
    // Create cache key from request
    const key = `${req.method}:${req.originalUrl}:${JSON.stringify(req.query)}`;
    
    // Try to get from cache
    const cachedResponse = cache.get(key);
    
    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    // Store original json method
    const originalJson = res.json;

    // Override json method to cache response
    res.json = function(data) {
      // Cache successful responses only
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, data, ttl);
      }
      
      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Generate cache key for user-specific data
 * @param {string} userId - User ID
 * @param {string} type - Data type
 * @param {Object} params - Additional parameters
 * @returns {string} Cache key
 */
const generateUserCacheKey = (userId, type, params = {}) => {
  const paramString = Object.keys(params).length > 0 ? `:${JSON.stringify(params)}` : '';
  return `user:${userId}:${type}${paramString}`;
};

/**
 * Generate cache key for leaderboard data
 * @param {Object} filters - Leaderboard filters
 * @returns {string} Cache key
 */
const generateLeaderboardCacheKey = (filters = {}) => {
  return `leaderboard:${JSON.stringify(filters)}`;
};

/**
 * Invalidate cache by pattern
 * @param {string} pattern - Pattern to match (simple string contains)
 */
const invalidateByPattern = (pattern) => {
  const keys = Array.from(cache.cache.keys());
  const keysToDelete = keys.filter(key => key.includes(pattern));
  
  keysToDelete.forEach(key => cache.delete(key));
};

module.exports = {
  cache,
  cacheMiddleware,
  generateUserCacheKey,
  generateLeaderboardCacheKey,
  invalidateByPattern
};
