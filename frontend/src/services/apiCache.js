import { cacheConfig } from '../utils/performanceConfig';

/**
 * API Cache management
 * Implements in-memory caching with TTL and versioning
 */
class ApiCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  /**
   * Generate cache key from endpoint and params
   */
  generateKey(endpoint, params = {}) {
    const paramString = JSON.stringify(params);
    return `${endpoint}:${paramString}`;
  }

  /**
   * Set cache with TTL
   */
  set(key, data, ttl = cacheConfig.MEDIUM) {
    // Clear existing timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Store data
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    // Set expiration timer
    const timer = setTimeout(() => {
      this.cache.delete(key);
      this.timers.delete(key);
    }, ttl);

    this.timers.set(key, timer);
  }

  /**
   * Get cache if not expired
   */
  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }

    const cached = this.cache.get(key);
    const age = Date.now() - cached.timestamp;

    if (age > cached.ttl) {
      this.cache.delete(key);
      this.timers.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Clear specific cache entry
   */
  clear(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clearAll() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.cache.clear();
    this.timers.clear();
  }

  /**
   * Get cache size in bytes
   */
  getSize() {
    let size = 0;
    this.cache.forEach(item => {
      size += JSON.stringify(item.data).length;
    });
    return size;
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      entries: this.cache.size,
      sizeKB: (this.getSize() / 1024).toFixed(2),
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const apiCache = new ApiCache();

/**
 * Cache invalidation patterns
 */
export const cacheInvalidation = {
  // Clear list caches when item is modified
  invalidateList: (resource) => {
    const keys = Array.from(apiCache.cache.keys()).filter(key =>
      key.startsWith(`${resource}:`)
    );
    keys.forEach(key => apiCache.clear(key));
  },

  // Clear specific resource cache
  invalidateResource: (resource, id) => {
    const key = `${resource}:${JSON.stringify({ id })}`;
    apiCache.clear(key);
  },

  // Clear all caches
  invalidateAll: () => {
    apiCache.clearAll();
  },
};

/**
 * Request deduplication
 * Prevents duplicate requests while one is in-flight
 */
class RequestDeduplicator {
  constructor() {
    this.inFlight = new Map();
  }

  async execute(key, requestFn) {
    // Return existing promise if request is in-flight
    if (this.inFlight.has(key)) {
      return this.inFlight.get(key);
    }

    // Execute request and store promise
    const promise = requestFn()
      .then(result => {
        this.inFlight.delete(key);
        return result;
      })
      .catch(error => {
        this.inFlight.delete(key);
        throw error;
      });

    this.inFlight.set(key, promise);
    return promise;
  }
}

export const requestDeduplicator = new RequestDeduplicator();
