/**
 * Authentication Middleware
 *
 * CHANGE: role + email are now embedded in the JWT payload.
 * The protect() middleware no longer hits MongoDB on every request —
 * it only decodes and verifies the token signature.
 * A DB fetch only happens when the route explicitly needs fresh user data
 * (e.g. /auth/me, logout).
 */

const jwt = require('jsonwebtoken')
const AppError = require('../utils/appError')

// Protect routes — verify JWT, attach lightweight user object from token payload
exports.protect = (req, res, next) => {
  let token

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return next(new AppError('Not authorized to access this route', 401, 'AUTH_REQUIRED'))
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Attach only what downstream handlers need — no DB round-trip
    req.user = {
      id:    decoded.id,
      role:  decoded.role,
      email: decoded.email,
    }

    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401, 'TOKEN_EXPIRED'))
    }
    return next(new AppError('Not authorized to access this route', 401, 'INVALID_AUTH_TOKEN'))
  }
}

// Role-based access control — works directly from token payload, no DB needed
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(
      new AppError(
        `Role '${req.user.role}' is not authorized to access this route`,
        403,
        'INSUFFICIENT_ROLE'
      )
    )
  }
  next()
}
