/**
 * Authentication Middleware
 * Verifies JWT tokens and protects routes
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authorized to access this route', 401, 'AUTH_REQUIRED'));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from token
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return next(new AppError('User not found', 401, 'USER_NOT_FOUND'));
    }

    next();
  } catch (error) {
    return next(new AppError('Not authorized to access this route', 401, 'INVALID_AUTH_TOKEN'));
  }
};

// Role-based access control
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Role '${req.user.role}' is not authorized to access this route`,
          403,
          'INSUFFICIENT_ROLE'
        )
      );
    }
    next();
  };
};
