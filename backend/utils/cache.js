/**
 * In-Memory Cache Utility with TTL
 * Production-ready caching for expensive queries
 * 
 * For Redis in production, replace this with:
 * npm install redis ioredis
 */

class CacheManager {
  constructor() {
    this.cache = new Map()
    this.ttls = new Map()
    this.stats = { hits: 0, misses: 0, sets: 0 }
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {any|null} - Cached value or null
   */
  get(key) {
    const ttl = this.ttls.get(key)
    
    // Check if expired
    if (ttl && Date.now() > ttl) {
      this.cache.delete(key)
      this.ttls.delete(key)
      this.stats.misses++
      return null
    }

    if (this.cache.has(key)) {
      this.stats.hits++
      return this.cache.get(key)
    }

    this.stats.misses++
    return null
  }

  /**
   * Set value in cache with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttlSeconds - Time to live in seconds (default: 300 = 5 minutes)
   */
  set(key, value, ttlSeconds = 300) {
    this.cache.set(key, value)
    this.ttls.set(key, Date.now() + (ttlSeconds * 1000))
    this.stats.sets++
  }

  /**
   * Delete specific key
   * @param {string} key - Cache key
   */
  del(key) {
    this.cache.delete(key)
    this.ttls.delete(key)
  }

  /**
   * Delete keys matching pattern
   * @param {string} pattern - Pattern to match (e.g., 'analytics:*')
   */
  delPattern(pattern) {
    const regex = new RegExp(pattern.replace('*', '.*'))
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
        this.ttls.delete(key)
      }
    }
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear()
    this.ttls.clear()
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      size: this.cache.size
    }
  }

  /**
   * Cleanup expired entries (run periodically)
   */
  cleanup() {
    const now = Date.now()
    for (const [key, ttl] of this.ttls.entries()) {
      if (now > ttl) {
        this.cache.delete(key)
        this.ttls.delete(key)
      }
    }
  }
}

// Singleton instance
const cache = new CacheManager()

// Cleanup expired entries every 5 minutes
setInterval(() => cache.cleanup(), 5 * 60 * 1000)

/**
 * Cache middleware wrapper for route handlers
 * @param {number} ttlSeconds - Cache TTL in seconds
 * @returns {Function} Express middleware
 */
const cacheMiddleware = (ttlSeconds = 300) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next()
    }

    // Build cache key from route + query params
    const cacheKey = `${req.originalUrl || req.url}`
    const cachedData = cache.get(cacheKey)

    if (cachedData) {
      res.setHeader('X-Cache', 'HIT')
      return res.json(cachedData)
    }

    // Override res.json to cache the response
    const originalJson = res.json.bind(res)
    res.json = (data) => {
      if (res.statusCode === 200) {
        cache.set(cacheKey, data, ttlSeconds)
      }
      res.setHeader('X-Cache', 'MISS')
      return originalJson(data)
    }

    next()
  }
}

/**
 * Invalidate cache for specific patterns
 * Use after data mutations (POST, PUT, DELETE)
 */
const invalidateCache = (...patterns) => {
  patterns.forEach(pattern => cache.delPattern(pattern))
}

module.exports = {
  cache,
  cacheMiddleware,
  invalidateCache
}
