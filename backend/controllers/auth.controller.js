/**
 * Authentication Controller
 * Handles user registration and login with persistent sessions
 */

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationError, unauthorizedError, conflictError } = require('../utils/errorFactory');
const sendSuccess = require('../utils/successResponse');

// Generate JWT access token (short-lived)
const generateAccessToken = (id, rememberMe = false) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: rememberMe ? '15m' : '5m' // Shorter expiration for session-only logins
  });
};

// Generate JWT refresh token (long-lived)
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: '7d' // Long-lived refresh token
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(conflictError('User already exists', 'USER_ALREADY_EXISTS'));
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    // For registration, default to session-only (no rememberMe)
    const rememberMe = false;
    
    // Generate tokens
    const accessToken = generateAccessToken(user._id, rememberMe);
    const refreshToken = rememberMe ? generateRefreshToken(user._id) : null;

    // Store refresh token in user document (for security)
    if (refreshToken) {
      user.refreshToken = refreshToken;
      await user.save();
    }

    return sendSuccess(res, {
      statusCode: 201,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password, rememberMe = true } = req.body;

    // Validate input
    if (!email || !password) {
      return next(validationError('Please provide email and password'));
    }

    // Check for user (include password for comparison)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(unauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS'));
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(unauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS'));
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id, rememberMe);
    const refreshToken = rememberMe ? generateRefreshToken(user._id) : null;

    // Store refresh token if rememberMe is true
    if (refreshToken) {
      user.refreshToken = refreshToken;
      await user.save();
    }

    return sendSuccess(res, {
      data: {
        accessToken,
        refreshToken,
        rememberMe,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(unauthorizedError('Refresh token required', 'REFRESH_TOKEN_REQUIRED'));
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    
    // Find user and check if refresh token matches
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return next(unauthorizedError('Invalid refresh token', 'INVALID_REFRESH_TOKEN'));
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user._id);

    return sendSuccess(res, {
      data: {
        accessToken: newAccessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    return next(unauthorizedError('Invalid refresh token', 'INVALID_REFRESH_TOKEN'));
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    return sendSuccess(res, { data: { user } });
  } catch (error) {
    return next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    // Clear refresh token from database
    const user = await User.findById(req.user.id);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    return sendSuccess(res, { message: 'Logged out successfully' });
  } catch (error) {
    return next(error);
  }
};
