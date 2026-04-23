/**
 * Authentication Controller
 *
 * CHANGES:
 * 1. JWT access token now embeds { id, role, email } — middleware no longer
 *    needs a DB query on every request.
 * 2. Refresh token is set as an httpOnly, Secure, SameSite=Strict cookie
 *    instead of being returned in the JSON body.  This prevents XSS from
 *    stealing the long-lived token.
 * 3. /auth/refresh reads the token from the cookie, not req.body.
 * 4. /auth/logout clears the cookie server-side.
 */

const User    = require('../models/User')
const jwt     = require('jsonwebtoken')
const crypto  = require('crypto')
const logger  = require('../utils/logger')
const { validationError, unauthorizedError, conflictError } = require('../utils/errorFactory')
const sendSuccess = require('../utils/successResponse')

// ── helpers ──────────────────────────────────────────────────────────────────

const emailMatchQuery = (email) => {
  const trimmed = String(email || '').trim()
  if (!trimmed) return null
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`^${escaped}$`, 'i')
}

/** Access token — short-lived, carries role so middleware skips DB */
const generateAccessToken = (user, rememberMe = false) =>
  jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: rememberMe ? '30m' : '15m' }
  )

/** Refresh token — long-lived, stored hashed in DB + sent as httpOnly cookie */
const generateRefreshToken = (userId) =>
  jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  )

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex')

/** Set the refresh token as an httpOnly cookie */
const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path:     '/api/auth',              // only sent to auth endpoints
  })
}

/** Clear the refresh token cookie */
const clearRefreshCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path:     '/api/auth',
  })
}

// ── controllers ───────────────────────────────────────────────────────────────

// @route POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body

    const emailQuery = emailMatchQuery(email)
    if (!emailQuery) return next(validationError('Invalid email', 'INVALID_EMAIL'))

    const exists = await User.findOne({ email: emailQuery }).select('_id').lean()
    if (exists) return next(conflictError('User already exists', 'USER_ALREADY_EXISTS'))

    const user = await User.create({ name, email, password, role })

    const accessToken  = generateAccessToken(user, false)
    // No refresh token on registration — session-only by default
    logger.info('user_registered', { userId: user._id, role: user.role })

    return sendSuccess(res, {
      statusCode: 201,
      data: {
        accessToken,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
    })
  } catch (err) {
    return next(err)
  }
}

// @route POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password, rememberMe = false } = req.body

    if (!email || !password) {
      return next(validationError('Please provide email and password', 'MISSING_CREDENTIALS'))
    }

    const emailQuery = emailMatchQuery(email)
    const user = emailQuery
      ? await User.findOne({ email: emailQuery }).select('+password +refreshToken +refreshTokenExpiresAt')
      : null

    if (!user || !(await user.comparePassword(password))) {
      // Same message for both cases — prevents user enumeration
      return next(unauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS'))
    }

    const accessToken = generateAccessToken(user, rememberMe)

    if (rememberMe) {
      const refreshToken = generateRefreshToken(user._id)
      user.refreshToken           = hashToken(refreshToken)
      user.refreshTokenExpiresAt  = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      setRefreshCookie(res, refreshToken)
    } else {
      // Clear any stale refresh cookie / DB token
      user.refreshToken          = null
      user.refreshTokenExpiresAt = null
      clearRefreshCookie(res)
    }

    user.lastLogin = new Date()
    await user.save()

    logger.info('user_login', { userId: user._id, role: user.role, rememberMe })

    return sendSuccess(res, {
      data: {
        accessToken,
        rememberMe,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
    })
  } catch (err) {
    return next(err)
  }
}

// @route POST /api/auth/refresh
exports.refreshToken = async (req, res, next) => {
  try {
    // Read from httpOnly cookie — NOT from req.body
    const token = req.cookies?.refreshToken

    if (!token) {
      return next(unauthorizedError('Refresh token required', 'REFRESH_TOKEN_REQUIRED'))
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
    } catch {
      return next(unauthorizedError('Invalid refresh token', 'INVALID_REFRESH_TOKEN'))
    }

    const user = await User.findById(decoded.id)
      .select('+refreshToken +refreshTokenExpiresAt')

    const hashed  = hashToken(token)
    const expired = user?.refreshTokenExpiresAt && user.refreshTokenExpiresAt < new Date()

    if (!user || expired || user.refreshToken !== hashed) {
      clearRefreshCookie(res)
      return next(unauthorizedError('Invalid refresh token', 'INVALID_REFRESH_TOKEN'))
    }

    // Rotate both tokens
    const newAccessToken  = generateAccessToken(user, true)
    const newRefreshToken = generateRefreshToken(user._id)

    user.refreshToken          = hashToken(newRefreshToken)
    user.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await user.save()

    setRefreshCookie(res, newRefreshToken)

    return sendSuccess(res, {
      data: {
        accessToken: newAccessToken,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
    })
  } catch (err) {
    return next(unauthorizedError('Invalid refresh token', 'INVALID_REFRESH_TOKEN'))
  }
}

// @route GET /api/auth/me  (needs fresh DB data — intentional)
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).lean()
    if (!user) return next(unauthorizedError('User not found', 'USER_NOT_FOUND'))
    return sendSuccess(res, { data: { user } })
  } catch (err) {
    return next(err)
  }
}

// @route POST /api/auth/logout
exports.logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      refreshToken:          null,
      refreshTokenExpiresAt: null,
    })
    clearRefreshCookie(res)
    logger.info('user_logout', { userId: req.user.id })
    return sendSuccess(res, { message: 'Logged out successfully' })
  } catch (err) {
    return next(err)
  }
}
