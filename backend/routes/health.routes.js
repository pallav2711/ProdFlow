/**
 * Health Check Routes
 * Provides system health and status information
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const axios = require('axios');
const asyncHandler = require('../middleware/asyncHandler');
const sendSuccess = require('../utils/successResponse');

// Basic health check
router.get('/', (req, res) => {
  const healthCheck = {
    status: 'ok',
    message: 'ProdFlow AI Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  };
  
  return sendSuccess(res, { data: healthCheck });
});

// Detailed system status
router.get('/status', asyncHandler(async (req, res) => {
    const status = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
          host: mongoose.connection.host,
          name: mongoose.connection.name
        },
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
        },
        uptime: Math.round(process.uptime()) + ' seconds'
      }
    };

    // Check AI service if URL is configured
    if (process.env.AI_SERVICE_URL) {
      try {
        const aiResponse = await axios.get(`${process.env.AI_SERVICE_URL}/health`, { timeout: 5000 });
        status.services.aiService = {
          status: 'connected',
          url: process.env.AI_SERVICE_URL,
          response: aiResponse.status
        };
      } catch (error) {
        status.services.aiService = {
          status: 'disconnected',
          url: process.env.AI_SERVICE_URL,
          error: error.message
        };
      }
    }

    return sendSuccess(res, { data: status });
}));

// Lightweight ping endpoint for monitoring
router.get('/ping', (req, res) => {
  return res.status(200).send('pong');
});

module.exports = router;