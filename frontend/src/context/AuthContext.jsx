import { createContext, useState, useContext, useEffect } from 'react'
import api from '../api/config'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Token refresh interval
  let refreshInterval = null

  // Set api default headers and setup token refresh
  useEffect(() => {
    initializeAuth()
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [])

  const initializeAuth = async () => {
    try {
      // Check both localStorage (persistent) and sessionStorage (session-only)
      const persistentAccessToken = localStorage.getItem('accessToken')
      const sessionAccessToken = sessionStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')
      const oldToken = localStorage.getItem('token') || sessionStorage.getItem('token')
      
      const accessToken = persistentAccessToken || sessionAccessToken
      const isSessionOnly = !!sessionAccessToken && !persistentAccessToken
      
      console.log('Initializing auth...', { 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken,
        hasOldToken: !!oldToken,
        isSessionOnly
      })
      
      // Handle old token format (backward compatibility)
      if (oldToken && !accessToken) {
        console.log('Found old token format, attempting to use it...')
        api.defaults.headers.common['Authorization'] = `Bearer ${oldToken}`
        try {
          await loadUser()
          console.log('Old token still valid, user loaded successfully')
          return
        } catch (error) {
          console.log('Old token expired, clearing it')
          localStorage.removeItem('token')
          sessionStorage.removeItem('token')
        }
      }
      
      if (accessToken) {
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
        
        // Try to load user with current token
        try {
          await loadUser()
          
          // Only setup token refresh for persistent sessions
          if (!isSessionOnly && refreshToken) {
            setupTokenRefresh()
          }
          
          console.log('Auth initialized successfully with existing token')
        } catch (error) {
          console.log('Access token expired, attempting refresh...', error.response?.status)
          
          // If access token is expired, try to refresh (only for persistent sessions)
          if (refreshToken && !isSessionOnly) {
            try {
              await refreshAccessToken()
              console.log('Token refreshed successfully')
            } catch (refreshError) {
              console.log('Refresh failed, clearing tokens:', refreshError.response?.status)
              // Refresh failed, clear tokens
              clearTokens()
            }
          } else {
            console.log('No refresh token available or session-only login, clearing tokens')
            clearTokens()
          }
        }
      } else {
        console.log('No access token found')
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      clearTokens()
    } finally {
      setLoading(false)
    }
  }

  const loadUser = async () => {
    const res = await api.get('/auth/me')
    setUser(res.data.user)
    return res.data.user
  }

  const setupTokenRefresh = () => {
    // Clear existing interval
    if (refreshInterval) {
      clearInterval(refreshInterval)
    }
    
    // Set up automatic token refresh every 10 minutes (access token expires in 15 minutes)
    refreshInterval = setInterval(async () => {
      try {
        await refreshAccessToken()
      } catch (error) {
        console.error('Auto refresh failed:', error)
        logout()
      }
    }, 10 * 60 * 1000) // 10 minutes
  }

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      console.log('Attempting to refresh access token...')
      const res = await api.post('/auth/refresh', { refreshToken })
      const { accessToken, user } = res.data
      
      localStorage.setItem('accessToken', accessToken)
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      setUser(user)
      
      console.log('Access token refreshed successfully')
      return res.data
    } catch (error) {
      console.error('Token refresh failed:', error.response?.data || error.message)
      // If refresh fails, clear all tokens
      clearTokens()
      throw error
    }
  }

  const clearTokens = () => {
    // Clear both localStorage and sessionStorage tokens
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('rememberMe')
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('rememberMe')
    
    // Clear old token format (backward compatibility)
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    
    if (refreshInterval) {
      clearInterval(refreshInterval)
      refreshInterval = null
    }
    
    console.log('All tokens cleared')
  }

  const login = async (email, password, rememberMe = false) => {
    try {
      const res = await api.post('/auth/login', { email, password, rememberMe })
      const { accessToken, refreshToken, user } = res.data
      
      console.log('Login successful', { hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken, rememberMe })
      
      // Clear any existing tokens first
      clearTokens()
      
      // Store tokens based on rememberMe preference
      if (rememberMe && refreshToken) {
        // Persistent storage - survives browser close
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        localStorage.setItem('rememberMe', 'true')
        setupTokenRefresh()
      } else {
        // Session storage - clears when browser/tab is closed
        sessionStorage.setItem('accessToken', accessToken)
        sessionStorage.setItem('rememberMe', 'false')
        // Don't store refresh token for session-only login
        // Don't setup auto-refresh for session-only login
      }
      
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      setUser(user)
      
      return res.data
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message)
      throw error
    }
  }

  const register = async (name, email, password, role) => {
    const res = await api.post('/auth/register', { name, email, password, role })
    const { accessToken, refreshToken, user } = res.data
    
    // Default to session-only for new registrations (more secure)
    sessionStorage.setItem('accessToken', accessToken)
    sessionStorage.setItem('rememberMe', 'false')
    
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    setUser(user)
    
    return res.data
  }

  const logout = async () => {
    try {
      // Call backend logout to invalidate refresh token
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearTokens()
    }
  }

  // Setup axios interceptor for automatic token refresh on 401 errors
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true
          
          try {
            await refreshAccessToken()
            // Retry the original request with new token
            return api(originalRequest)
          } catch (refreshError) {
            logout()
            return Promise.reject(refreshError)
          }
        }
        
        return Promise.reject(error)
      }
    )

    return () => {
      api.interceptors.response.eject(interceptor)
    }
  }, [])

  // Handle browser close for session-only users
  useEffect(() => {
    const handleBeforeUnload = () => {
      const rememberMe = localStorage.getItem('rememberMe')
      if (rememberMe === 'false') {
        clearTokens()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshAccessToken
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
