/**
 * ProdFlow AI - Backend Server
 * Main entry point for Express.js API with Performance Optimizations
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');

// Load environment variables from .env file
const envPath = path.join(__dirname, '.env');
console.log('🔧 Loading environment from:', envPath);

// In production, environment variables are set by the hosting platform
// so .env file might not exist - this is normal
if (process.env.NODE_ENV === 'production') {
  console.log('🏭 Production environment detected - using platform environment variables');
} else {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error('❌ Error loading .env file:', result.error);
    console.log('📁 Current working directory:', process.cwd());
    console.log('📁 __dirname:', __dirname);
  } else {
    console.log('✅ Environment variables loaded successfully');
  }
}

// Debug: Log important environment variables (without sensitive data)
console.log('🔍 Environment Check:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('- AI_SERVICE_URL:', process.env.AI_SERVICE_URL);

// Initialize Express app
const app = express();

// Connect to MongoDB with optimized settings
connectDB();

// Performance and Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for now to avoid conflicts
  crossOriginEmbedderPolicy: false
}));

// Enable compression for all responses
app.use(compression({
  level: 6, // Compression level (1-9, 6 is good balance)
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Limit each IP to 100 requests per windowMs in production
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes only
app.use('/api/', limiter);

// CORS with optimized settings
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://prodflowaii.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200, // For legacy browser support
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  const morgan = require('morgan');
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/sprints', require('./routes/sprint.routes'));
app.use('/api/teams', require('./routes/team.routes'));

// Health check endpoint with detailed info
app.get('/api/health', (req, res) => {
  const healthCheck = {
    status: 'ok',
    message: 'ProdFlow AI Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  };
  
  res.json(healthCheck);
});

// Lightweight ping endpoint for monitoring
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(isDevelopment && { stack: err.stack })
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 CORS enabled for: http://localhost:3000, https://prodflowaii.vercel.app`);
  console.log(`🔒 Security middleware enabled`);
  console.log(`📦 Compression enabled`);
  console.log(`⚡ Performance optimizations active`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
});

module.exports = app;
