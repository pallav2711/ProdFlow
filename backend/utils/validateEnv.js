/**
 * Startup environment validation.
 * Call this before anything else in server.js.
 * The process exits immediately if a required variable is missing —
 * better to crash loudly at boot than silently misbehave in production.
 */

const REQUIRED = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
]

function validateEnv () {
  const missing = REQUIRED.filter(k => !process.env[k])
  if (missing.length) {
    console.error(
      `[FATAL] Missing required environment variables: ${missing.join(', ')}\n` +
      'Copy .env.example → .env and fill in the values.'
    )
    process.exit(1)
  }

  // Warn about weak secrets (< 32 chars)
  const weak = ['JWT_SECRET', 'JWT_REFRESH_SECRET'].filter(
    k => process.env[k] && process.env[k].length < 32
  )
  if (weak.length) {
    console.warn(`[WARN] Weak secrets detected for: ${weak.join(', ')} — use at least 32 random characters.`)
  }
}

module.exports = validateEnv
