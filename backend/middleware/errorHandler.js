/**
 * Global Error Handler Middleware
 * Provides consistent error responses and structured logging.
 */

const AppError = require('../utils/appError');

const errorHandler = (err, req, res, next) => {
  let normalizedError = err;

  if (err.name === 'CastError') {
    normalizedError = new AppError('Resource not found', 404, 'RESOURCE_NOT_FOUND');
  } else if (err.code === 11000) {
    normalizedError = new AppError('Duplicate field value entered', 400, 'DUPLICATE_RESOURCE', {
      fields: Object.keys(err.keyValue || {})
    });
  } else if (err.name === 'ValidationError') {
    normalizedError = new AppError(
      Object.values(err.errors || {}).map((val) => val.message).join(', ') || 'Validation failed',
      400,
      'VALIDATION_ERROR'
    );
  } else if (err.name === 'JsonWebTokenError') {
    normalizedError = new AppError('Invalid token', 401, 'INVALID_TOKEN');
  } else if (err.name === 'TokenExpiredError') {
    normalizedError = new AppError('Token expired', 401, 'TOKEN_EXPIRED');
  } else if (err.name === 'MongoNetworkError') {
    normalizedError = new AppError('Database connection error', 503, 'DATABASE_UNAVAILABLE');
  } else if (err.status === 429) {
    normalizedError = new AppError('Too many requests, please try again later', 429, 'RATE_LIMITED');
  } else if (err.type === 'entity.parse.failed') {
    normalizedError = new AppError('Invalid JSON format', 400, 'INVALID_JSON');
  } else if (!(err instanceof AppError)) {
    normalizedError = new AppError(err.message || 'Server Error', err.statusCode || 500, 'INTERNAL_ERROR');
  }

  const statusCode = normalizedError.statusCode || 500;
  const code = normalizedError.code || 'INTERNAL_ERROR';
  const requestId = req.requestId || req.get('X-Request-ID') || 'unknown';
  const isDev = process.env.NODE_ENV === 'development';

  console.error(
    JSON.stringify({
      level: 'error',
      event: 'request_failed',
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode,
      code,
      message: normalizedError.message,
      details: normalizedError.details || null,
      stack: isDev ? err.stack : undefined
    })
  );

  res.status(statusCode).json({
    success: false,
    code,
    message: normalizedError.message || 'Server Error',
    details: normalizedError.details || undefined,
    requestId,
    timestamp: new Date().toISOString(),
    ...(isDev && { stack: err.stack })
  });
};

module.exports = errorHandler;