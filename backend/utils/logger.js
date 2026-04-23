/**
 * Structured JSON logger
 * All output goes to stdout so Render / Vercel / any platform captures it.
 * In development the output is pretty-printed for readability.
 */

const IS_DEV = process.env.NODE_ENV !== 'production'

function entry (level, event, data = {}) {
  const record = {
    level,
    ts: new Date().toISOString(),
    event,
    ...data,
  }
  const line = IS_DEV
    ? `[${level.toUpperCase()}] ${event} ${Object.keys(data).length ? JSON.stringify(data, null, 2) : ''}`
    : JSON.stringify(record)

  if (level === 'error') console.error(line)
  else if (level === 'warn')  console.warn(line)
  else                        console.log(line)
}

const logger = {
  info:  (event, data) => entry('info',  event, data),
  warn:  (event, data) => entry('warn',  event, data),
  error: (event, data) => entry('error', event, data),
  debug: (event, data) => { if (IS_DEV) entry('debug', event, data) },
}

module.exports = logger
