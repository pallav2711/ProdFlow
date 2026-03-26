/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const { register, login, getMe, refreshToken, logout } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');
const asyncHandler = require('../middleware/asyncHandler');

router.post('/register', validateRegister, asyncHandler(register));
router.post('/login', validateLogin, asyncHandler(login));
router.post('/refresh', asyncHandler(refreshToken));
router.post('/logout', protect, asyncHandler(logout));
router.get('/me', protect, asyncHandler(getMe));

module.exports = router;
