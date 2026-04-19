/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { register, login, getMe, refreshToken, logout } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');
const asyncHandler = require('../middleware/asyncHandler');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'AUTH_RATE_LIMITED',
    message: 'Too many authentication attempts, please try again later.'
  }
});

router.post('/register', authLimiter, validateRegister, asyncHandler(register));
router.post('/login', authLimiter, validateLogin, asyncHandler(login));
router.post('/refresh', authLimiter, asyncHandler(refreshToken));
router.post('/logout', protect, asyncHandler(logout));
router.get('/me', protect, asyncHandler(getMe));

module.exports = router;
