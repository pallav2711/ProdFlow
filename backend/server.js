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
const errorHandler = require('./middleware/errorHandler');
const requestContext = require('./middleware/requestContext');
const AppError = require('./utils/appError');

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

// Request context middleware (request id + request timing logs)
app.use(requestContext);

// Performance and Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS debugging middleware (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log('🌐 CORS Debug:', {
      method: req.method,
      origin: req.headers.origin,
      headers: Object.keys(req.headers).filter(h => h.startsWith('access-control') || h === 'origin'),
      url: req.url
    });
    next();
  });
}

// Additional security middleware
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Feature Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
});

// Prevent parameter pollution
app.use((req, res, next) => {
  // Ensure query parameters are not arrays (prevent HPP attacks)
  for (const key in req.query) {
    if (Array.isArray(req.query[key])) {
      req.query[key] = req.query[key][0]; // Take only the first value
    }
  }
  next();
});
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

// Rate limiting to prevent abuse - MOVED AFTER CORS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 1000 : 10000, // Much higher limits
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for CORS preflight requests
  skip: (req) => req.method === 'OPTIONS',
  // Custom handler to ensure CORS headers are always sent
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      code: 'RATE_LIMITED',
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes',
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }
});

// CORS with comprehensive configuration - PERMANENT SOLUTION
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) {
      console.log('✅ CORS: Allowing request with no origin');
      return callback(null, true);
    }
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173', // Vite dev server
      'https://prodflowaii.vercel.app',
      'https://prodflow-ai.vercel.app',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    // Allow all Vercel deployments for this project
    const isVercelDeployment = origin.includes('vercel.app') && 
                              (origin.includes('prodflow') || origin.includes('pallav2711'));
    
    // Allow localhost with any port for development
    const isLocalhost = origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:');
    
    if (allowedOrigins.includes(origin) || isVercelDeployment || isLocalhost) {
      console.log('✅ CORS: Allowing origin:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS: Blocking origin:', origin);
      console.log('Allowed origins:', allowedOrigins);
      callback(new Error(`CORS policy violation: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Request-ID',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: [
    'X-Request-ID',
    'X-Response-Time'
  ],
  maxAge: 86400 // 24 hours preflight cache
};

app.use(cors(corsOptions));

// CORS debugging middleware (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log('🌐 CORS Debug:', {
      method: req.method,
      origin: req.headers.origin,
      headers: Object.keys(req.headers).filter(h => h.startsWith('access-control') || h === 'origin'),
      url: req.url
    });
    next();
  });
}

// Custom middleware to ensure CORS headers are always present
app.use((req, res, next) => {
  // Always set CORS headers for allowed origins
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://prodflowaii.vercel.app',
    'https://prodflow-ai.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean);
  
  const isVercelDeployment = origin && origin.includes('vercel.app') && 
                            (origin.includes('prodflow') || origin.includes('pallav2711'));
  const isLocalhost = origin && (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:'));
  
  if (!origin || allowedOrigins.includes(origin) || isVercelDeployment || isLocalhost) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Request-ID, Cache-Control, Pragma');
    res.setHeader('Access-Control-Expose-Headers', 'X-Request-ID, X-Response-Time');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
  
  next();
});

// Apply rate limiting to API routes only - AFTER CORS to ensure CORS headers are always sent
app.use('/api/', limiter);

// Body parsing middleware with size limits and validation
app.use(express.json({ 
  limit: '1mb',
  verify: (req, res, buf) => {
    // Empty body is valid for routes that do not require JSON payload.
    if (!buf || buf.length === 0) {
      return;
    }

    // Prevent JSON pollution attacks
    try {
      JSON.parse(buf);
    } catch (e) {
      throw new AppError('Invalid JSON format', 400, 'INVALID_JSON');
    }
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '1mb',
  parameterLimit: 20 // Limit number of parameters
}));

// Input sanitization middleware
app.use((req, res, next) => {
  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  next();
});

// Sanitization function
function sanitizeObject(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return typeof obj === 'string' ? sanitizeString(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    // Block keys commonly abused for NoSQL/prototype pollution attacks.
    if (
      key === '__proto__' ||
      key === 'prototype' ||
      key === 'constructor' ||
      key.startsWith('$') ||
      key.includes('.')
    ) {
      continue;
    }

    const sanitizedKey = sanitizeString(key);
    if (typeof value === 'object' && value !== null) {
      sanitized[sanitizedKey] = sanitizeObject(value);
    } else if (typeof value === 'string') {
      sanitized[sanitizedKey] = sanitizeString(value);
    } else {
      sanitized[sanitizedKey] = value;
    }
  }
  return sanitized;
}

function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/[<>'"]/g, (match) => { // Escape HTML characters
      const htmlEntities = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;'
      };
      return htmlEntities[match];
    });
}

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
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/health', require('./routes/health.routes'));

// CORS test endpoint
app.options('/api/cors-test', (req, res) => {
  res.status(200).json({ message: 'CORS preflight successful' });
});

app.get('/api/cors-test', (req, res) => {
  res.json({
    message: 'CORS test successful',
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
    headers: req.headers
  });
});

// Legacy health check endpoints (for backward compatibility)
app.get('/health', (req, res) => res.redirect('/api/health'));
app.get('/ping', (req, res) => res.redirect('/api/health/ping'));

// 404 handler for API routes
app.use('/api/*', (req, res, next) => {
  next(
    new AppError('API endpoint not found', 404, 'API_ROUTE_NOT_FOUND', {
      path: req.originalUrl
    })
  );
});

// Global error handling middleware
app.use(errorHandler);

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
  console.log(`🌐 CORS enabled for: localhost:3000, prodflowaii.vercel.app, and all Vercel preview deployments`);
  console.log(`🔒 Security middleware enabled`);
  console.log(`📦 Compression enabled`);
  console.log(`⚡ Performance optimizations active`);
});

// Server-level timeout guards to prevent slow clients/dependencies from stalling resources.
server.requestTimeout = parseInt(process.env.SERVER_REQUEST_TIMEOUT_MS || '30000', 10);
server.headersTimeout = parseInt(process.env.SERVER_HEADERS_TIMEOUT_MS || '35000', 10);
server.keepAliveTimeout = parseInt(process.env.SERVER_KEEP_ALIVE_TIMEOUT_MS || '5000', 10);

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
});

module.exports = app;
