/**
 * Performance Monitoring Routes
 * Provides insights into backend performance metrics
 */
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const { cache } = require('../utils/cache')
const { jobQueue } = require('../utils/jobQueue')
const { protect, authorize } = require('../middleware/auth')

/**
 * Get system performance metrics
 * @route GET /api/performance/metrics
 * @access Private (Product Manager only)
 */
router.get('/metrics', protect, authorize('Product Manager'), async (req, res) => {
  const memUsage = process.memoryUsage()
  const uptime = process.uptime()

  // MongoDB connection stats
  const dbStats = {
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    collections: Object.keys(mongoose.connection.collections).length
  }

  // Cache stats
  const cacheStats = cache.getStats()

  // Job queue stats
  const queueStats = jobQueue.getStats()

  res.json({
    success: true,
    metrics: {
      server: {
        uptime: `${Math.floor(uptime / 60)} minutes`,
        uptimeSeconds: uptime,
        nodeVersion: process.version,
        platform: process.platform,
        pid: process.pid
      },
      memory: {
        rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        external: `${(memUsage.external / 1024 / 1024).toFixed(2)} MB`,
        heapUsagePercent: `${((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(2)}%`
      },
      database: dbStats,
      cache: cacheStats,
      jobQueue: queueStats
    },
    timestamp: new Date().toISOString()
  })
})

/**
 * Get slow query log (if enabled)
 * @route GET /api/performance/slow-queries
 * @access Private (Product Manager only)
 */
router.get('/slow-queries', protect, authorize('Product Manager'), async (req, res) => {
  // This would require MongoDB profiling to be enabled
  // For now, return placeholder
  res.json({
    success: true,
    message: 'Enable MongoDB profiling to track slow queries',
    queries: []
  })
})

/**
 * Clear cache manually
 * @route POST /api/performance/cache/clear
 * @access Private (Product Manager only)
 */
router.post('/cache/clear', protect, authorize('Product Manager'), async (req, res) => {
  const { pattern } = req.body

  if (pattern) {
    cache.delPattern(pattern)
    res.json({
      success: true,
      message: `Cache cleared for pattern: ${pattern}`
    })
  } else {
    cache.clear()
    res.json({
      success: true,
      message: 'All cache cleared'
    })
  }
})

/**
 * Get database collection stats
 * @route GET /api/performance/db-stats
 * @access Private (Product Manager only)
 */
router.get('/db-stats', protect, authorize('Product Manager'), async (req, res) => {
  try {
    const db = mongoose.connection.db
    const collections = await db.listCollections().toArray()
    
    const stats = await Promise.all(
      collections.map(async (col) => {
        const collStats = await db.collection(col.name).stats()
        return {
          name: col.name,
          count: collStats.count,
          size: `${(collStats.size / 1024).toFixed(2)} KB`,
          avgObjSize: `${(collStats.avgObjSize / 1024).toFixed(2)} KB`,
          indexes: collStats.nindexes,
          indexSize: `${(collStats.totalIndexSize / 1024).toFixed(2)} KB`
        }
      })
    )

    res.json({
      success: true,
      collections: stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch database stats',
      error: error.message
    })
  }
})

module.exports = router
