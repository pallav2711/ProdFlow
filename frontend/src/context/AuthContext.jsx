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

  // Set api default headers
  useEffect(() => {
    // Use sessionStorage instead of localStorage for auto-logout on browser close
    const token = sessionStorage.getItem('token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      loadUser()
    } else {
      setLoading(false)
    }
  }, [])

  const loadUser = async () => {
    try {
      const res = await api.get('/auth/me')
      setUser(res.data.user)
    } catch (error) {
      console.error('Load user error:', error)
      sessionStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    // Store in sessionStorage - will be cleared when browser closes
    sessionStorage.setItem('token', res.data.token)
    api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
    setUser(res.data.user)
    return res.data
  }

  const register = async (name, email, password, role) => {
    const res = await api.post('/auth/register', { name, email, password, role })
    // Store in sessionStorage - will be cleared when browser closes
    sessionStorage.setItem('token', res.data.token)
    api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
    setUser(res.data.user)
    return res.data
  }

  const logout = () => {
    sessionStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
