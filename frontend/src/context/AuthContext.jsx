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
      const accessToken = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')
      
      if (accessToken) {
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
        
        // Try to load user with current token
        try {
          await loadUser()
          setupTokenRefresh()
        } catch (error) {
          // If access token is expired, try to refresh
          if (refreshToken) {
            try {
              await refreshAccessToken()
            } catch (refreshError) {
              // Refresh failed, clear tokens and redirect to login
              clearTokens()
            }
          } else {
            clearTokens()
          }
        }
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

    const res = await api.post('/auth/refresh', { refreshToken })
    const { accessToken, user } = res.data
    
    localStorage.setItem('accessToken', accessToken)
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    setUser(user)
    
    return res.data
  }

  const clearTokens = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('rememberMe')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    
    if (refreshInterval) {
      clearInterval(refreshInterval)
      refreshInterval = null
    }
  }

  const login = async (email, password, rememberMe = true) => {
    const res = await api.post('/auth/login', { email, password, rememberMe })
    const { accessToken, refreshToken, user } = res.data
    
    // Store tokens based on rememberMe preference
    if (rememberMe && refreshToken) {
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('rememberMe', 'true')
      setupTokenRefresh()
    } else {
      // For session-only login, still use localStorage but clear on browser close
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('rememberMe', 'false')
      // Don't store refresh token for session-only login
    }
    
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    setUser(user)
    
    return res.data
  }

  const register = async (name, email, password, role) => {
    const res = await api.post('/auth/register', { name, email, password, role })
    const { accessToken, refreshToken, user } = res.data
    
    // Default to remember me for new registrations
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('rememberMe', 'true')
    
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    setUser(user)
    setupTokenRefresh()
    
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
