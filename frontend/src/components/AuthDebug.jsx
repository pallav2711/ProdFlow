import { useState } from 'react'
import api from '../api/config'

const AuthDebug = () => {
  const [debugInfo, setDebugInfo] = useState({})
  const [loading, setLoading] = useState(false)

  const testBackendConnection = async () => {
    setLoading(true)
    const results = {}
    
    try {
      // Test basic backend connection
      const healthRes = await fetch('https://prodflow-6rmm.onrender.com/health')
      results.backendHealth = {
        status: healthRes.status,
        ok: healthRes.ok
      }
    } catch (error) {
      results.backendHealth = { error: error.message }
    }

    try {
      // Test auth endpoints
      const authTest = await api.get('/auth/me')
      results.authEndpoint = { status: 'accessible', data: authTest.data }
    } catch (error) {
      results.authEndpoint = { 
        status: error.response?.status || 'network_error',
        message: error.response?.data?.message || error.message 
      }
    }

    // Check localStorage
    results.localStorage = {
      accessToken: !!localStorage.getItem('accessToken'),
      refreshToken: !!localStorage.getItem('refreshToken'),
      rememberMe: localStorage.getItem('rememberMe'),
      oldToken: !!localStorage.getItem('token')
    }

    // Check API headers
    results.apiHeaders = {
      authorization: api.defaults.headers.common['Authorization']
    }

    setDebugInfo(results)
    setLoading(false)
  }

  const clearAllTokens = () => {
    localStorage.clear()
    sessionStorage.clear()
    delete api.defaults.headers.common['Authorization']
    setDebugInfo({})
    alert('All tokens cleared. Please refresh and try logging in again.')
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-md">
      <h3 className="font-bold mb-2">Auth Debug Panel</h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={testBackendConnection}
          disabled={loading}
          className="w-full bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Backend Connection'}
        </button>
        
        <button
          onClick={clearAllTokens}
          className="w-full bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
        >
          Clear All Tokens
        </button>
      </div>

      {Object.keys(debugInfo).length > 0 && (
        <div className="text-xs">
          <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default AuthDebug