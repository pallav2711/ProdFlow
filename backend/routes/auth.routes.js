/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const { register, login, getMe, refreshToken, logout } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
