/**
 * AuthContext
 *
 * CHANGES:
 * - Refresh token is now an httpOnly cookie managed by the server.
 *   All localStorage.getItem/setItem('refreshToken') calls removed.
 * - Duplicate response interceptor removed — api/config.js owns that logic.
 * - clearTokens() only touches accessToken storage.
 * - login() no longer stores refreshToken in localStorage.
 * - refreshAccessToken() sends an empty POST — cookie is sent automatically.
 */

import { createContext, useState, useContext, useEffect, useRef } from 'react'
import api from '../api/config'
import { getApiErrorMessage, assertApiSuccess } from '../utils/apiError'

const AuthContext = createContext()

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const refreshTimer          = useRef(null)

  useEffect(() => {
    initializeAuth()
    return () => clearInterval(refreshTimer.current)
  }, [])

  const clearTokens = () => {
    localStorage.removeItem('accessToken')
    sessionStorage.removeItem('accessToken')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    clearInterval(refreshTimer.current)
  }

  const loadUser = async () => {
    const res = await api.get('/auth/me')
    assertApiSuccess(res, 'Not authenticated')
    setUser(res.data.user)
    return res.data.user
  }

  const setupTokenRefresh = () => {
    clearInterval(refreshTimer.current)
    // Refresh 3 min before the 15-min access token expires
    refreshTimer.current = setInterval(async () => {
      try { await refreshAccessToken() }
      catch { logout() }
    }, 12 * 60 * 1000)
  }

  const refreshAccessToken = async () => {
    // No body — browser sends the httpOnly cookie automatically
    const res = await api.post('/auth/refresh')
    assertApiSuccess(res, 'Session expired. Please sign in again.')
    const { accessToken, user: freshUser } = res.data

    localStorage.setItem('accessToken', accessToken)
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    if (freshUser) setUser(freshUser)
    return accessToken
  }

  const initializeAuth = async () => {
    try {
      const token =
        localStorage.getItem('accessToken') ||
        sessionStorage.getItem('accessToken')

      if (!token) return

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      try {
        await loadUser()
        if (localStorage.getItem('accessToken')) setupTokenRefresh()
      } catch {
        // Access token expired — try silent refresh via cookie
        try {
          await refreshAccessToken()
          await loadUser()
          setupTokenRefresh()
        } catch {
          clearTokens()
        }
      }
    } catch {
      clearTokens()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password, rememberMe = false) => {
    const res = await api.post('/auth/login', { email, password, rememberMe })
    assertApiSuccess(res, 'Invalid email or password')
    const { accessToken, user: loggedInUser } = res.data

    clearTokens()

    if (rememberMe) {
      localStorage.setItem('accessToken', accessToken)
      setupTokenRefresh()
    } else {
      sessionStorage.setItem('accessToken', accessToken)
    }

    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    setUser(loggedInUser)
    return res.data
  }

  const register = async (name, email, password, role) => {
    const res = await api.post('/auth/register', { name, email, password, role })
    assertApiSuccess(res, 'Registration failed')
    const { accessToken, user: newUser } = res.data

    sessionStorage.setItem('accessToken', accessToken)
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    setUser(newUser)
    return res.data
  }

  const logout = async () => {
    try { await api.post('/auth/logout') } catch { /* best-effort */ }
    finally { clearTokens() }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  )
}
