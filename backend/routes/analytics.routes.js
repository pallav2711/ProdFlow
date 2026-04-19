/**
 * Analytics Routes
 * Provides data endpoints for AI Performance Analysis Service
 */
const express = require('express')
const router = express.Router()
const {
  getSprintAnalytics,
  getTaskAnalytics,
  getReviewAnalytics,
  getUserAnalytics,
  getCompleteAnalytics,
  getAnalyticsSummary
} = require('../controllers/analytics.controller')
const { protect, authorize } = require('../middleware/auth')

// Middleware to check if request is from AI service or authenticated user
const aiServiceOrAuth = (req, res, next) => {
  // Check if request has AI service API key
  const aiServiceKey = req.headers['x-ai-service-key']
  const expectedKey = process.env.AI_SERVICE_API_KEY || 'ai-service-internal-key-2024'
  
  if (aiServiceKey === expectedKey) {
    // Request from AI service - allow without user auth
    console.log('✅ AI Service authenticated via API key')
    return next()
  }
  
  // Otherwise, require user authentication
  protect(req, res, next)
}

// Individual data endpoints - accessible by AI service or authenticated Product Managers
router.get('/sprints', aiServiceOrAuth, getSprintAnalytics)
router.get('/tasks', aiServiceOrAuth, getTaskAnalytics)
router.get('/reviews', aiServiceOrAuth, getReviewAnalytics)
router.get('/users', aiServiceOrAuth, getUserAnalytics)

// Complete dataset endpoint - accessible by AI service or authenticated Product Managers
router.get('/complete', aiServiceOrAuth, getCompleteAnalytics)

// Summary statistics - accessible by AI service or authenticated Product Managers
router.get('/summary', aiServiceOrAuth, getAnalyticsSummary)

// Protected routes for Product Managers only (when accessed via user auth)
router.use((req, res, next) => {
  // If AI service key was used, skip role check
  const aiServiceKey = req.headers['x-ai-service-key']
  const expectedKey = process.env.AI_SERVICE_API_KEY || 'ai-service-internal-key-2024'
  
  if (aiServiceKey === expectedKey) {
    return next()
  }
  
  // Otherwise require Product Manager role
  authorize('Product Manager')(req, res, next)
})

module.exports = router
