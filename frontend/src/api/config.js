/**
 * Axios instance
 *
 * CHANGES:
 * - Refresh token is now an httpOnly cookie — never read/written from JS.
 * - POST /auth/refresh sends no body; the browser attaches the cookie automatically.
 * - Removed refreshToken from localStorage entirely.
 * - Single interceptor here — the duplicate in AuthContext.jsx has been removed.
 * - 401 handling: one retry via /auth/refresh, then redirect to /login.
 */

import axios from 'axios'
import { normalizeApiError } from '../utils/apiError'

const api = axios.create({
  baseURL:      import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout:      30000,
  withCredentials: true,   // send httpOnly cookies on every request
  headers: {
    'Content-Type': 'application/json',
    Accept:         'application/json',
  },
  decompress:   true,
  maxRedirects: 3,
  validateStatus: (s) => s < 500,
})

// ── request interceptor ───────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
    config.metadata = { startTime: Date.now() }
    config.headers['X-Request-ID'] = Math.random().toString(36).slice(2)
    return config
  },
  (err) => Promise.reject(err)
)

// ── response interceptor ──────────────────────────────────────────────────────
let isRefreshing = false
let queue = []

const flushQueue = (err, token = null) => {
  queue.forEach(p => err ? p.reject(err) : p.resolve(token))
  queue = []
}

api.interceptors.response.use(
  (res) => {
    if (import.meta.env.DEV && res.config.metadata) {
      const ms = Date.now() - res.config.metadata.startTime
      console.log(`API ${res.config.method?.toUpperCase()} ${res.config.url}: ${ms}ms`)
    }
    return res
  },
  async (err) => {
    const original = err.config

    // ── 401: attempt one silent refresh via httpOnly cookie ──────────────────
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true

      if (isRefreshing) {
        return new Promise((resolve, reject) => queue.push({ resolve, reject }))
          .then(token => {
            original.headers.Authorization = `Bearer ${token}`
            return api(original)
          })
      }

      isRefreshing = true
      try {
        // No body needed — browser sends the httpOnly cookie automatically
        const { data } = await api.post('/auth/refresh')
        const newToken = data?.data?.accessToken
        if (!newToken) throw new Error('No access token in refresh response')

        // Persist in the same storage the user originally chose
        if (localStorage.getItem('accessToken')) {
          localStorage.setItem('accessToken', newToken)
        } else {
          sessionStorage.setItem('accessToken', newToken)
        }

        api.defaults.headers.common.Authorization = `Bearer ${newToken}`
        flushQueue(null, newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch (refreshErr) {
        flushQueue(refreshErr)
        localStorage.removeItem('accessToken')
        sessionStorage.removeItem('accessToken')
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    // ── 429: honour Retry-After header ───────────────────────────────────────
    if (err.response?.status === 429) {
      const wait = (parseInt(err.response.headers['retry-after']) || 5) * 1000
      await new Promise(r => setTimeout(r, wait))
      return api(original)
    }

    // ── network errors: up to 3 retries with exponential back-off ────────────
    const isNetworkErr = !err.response && (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED')
    if (isNetworkErr && (original._retryCount || 0) < 3) {
      original._retryCount = (original._retryCount || 0) + 1
      const delay = Math.min(1000 * 2 ** (original._retryCount - 1), 8000) + Math.random() * 500
      await new Promise(r => setTimeout(r, delay))
      return api(original)
    }

    err.normalizedError = normalizeApiError(err)
    return Promise.reject(err)
  }
)

export const checkApiHealth = async () => {
  try {
    const res = await api.get('/health/status', { timeout: 5000 })
    return res.data
  } catch (e) {
    return { status: 'error', message: e.message }
  }
}

/**
 * Preload critical data on app start
 * This can be used to warm up caches or prefetch essential data
 */
export const preloadCriticalData = async () => {
  // Optional: Preload user data, products, etc. when app starts
  // For now, this is a no-op but can be extended as needed
  try {
    // Example: await api.get('/products?limit=10')
    // Example: await api.get('/sprints?limit=10')
  } catch (error) {
    // Silently fail - preloading is optional
    console.debug('Preload failed:', error.message)
  }
}

export default api
