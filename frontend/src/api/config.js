import axios from 'axios';
import { normalizeApiError } from '../utils/apiError';

// Create axios instance with optimized configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 30000, // Increased timeout for better reliability
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Enable request/response compression
  decompress: true,
  // Connection keep-alive for better performance
  maxRedirects: 3,
  // Retry configuration for unreliable free hosting
  validateStatus: (status) => status < 500, // Don't throw on 4xx errors
});

// Request queue for handling concurrent requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token
    const accessToken = localStorage.getItem('accessToken');
    const oldToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else if (oldToken) {
      config.headers.Authorization = `Bearer ${oldToken}`;
    }

    // Add request timestamp for performance monitoring
    config.metadata = { startTime: Date.now() };
    
    // Add request ID for tracking (now properly configured in CORS)
    config.headers['X-Request-ID'] = Math.random().toString(36).substring(7);
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor with enhanced error handling
api.interceptors.response.use(
  (response) => {
    // Log response time in development
    if (import.meta.env.DEV && response.config.metadata) {
      const duration = Date.now() - response.config.metadata.startTime;
      console.log(`API ${response.config.method?.toUpperCase()} ${response.config.url}: ${duration}ms`);
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors with retry logic for free hosting
    if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
      if (!originalRequest._retry && (originalRequest._retryCount || 0) < 3) {
        originalRequest._retry = true;
        originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
        
        console.log(`Retrying request (${originalRequest._retryCount}/3):`, originalRequest.url);
        
        // Exponential backoff with jitter
        const delay = Math.min(1000 * Math.pow(2, originalRequest._retryCount - 1), 10000) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return api(originalRequest);
      }
    }

    // Handle 401 errors (authentication) with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('401 error detected, attempting token refresh...');
      
      if (isRefreshing) {
        // If already refreshing, queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          console.log('Attempting to refresh token...');
          const response = await api.post('/auth/refresh', { refreshToken });
          const { accessToken, refreshToken: nextRefreshToken } = response.data;
          
          localStorage.setItem('accessToken', accessToken);
          if (nextRefreshToken) {
            localStorage.setItem('refreshToken', nextRefreshToken);
          }
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          
          processQueue(null, accessToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } else {
          console.log('No refresh token available');
          throw new Error('No refresh token available');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        processQueue(refreshError, null);
        
        // Clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('accessToken');
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          console.log('Redirecting to login due to authentication failure');
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 429 (rate limiting) with exponential backoff
    if (error.response?.status === 429) {
      const retryAfter = parseInt(error.response.headers['retry-after']) || 1;
      console.log(`Rate limited. Retrying after ${retryAfter} seconds...`);
      
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return api(originalRequest);
    }

    // Handle 5xx errors with retry
    if (error.response?.status >= 500 && (originalRequest._serverRetryCount || 0) < 2) {
      originalRequest._serverRetryCount = (originalRequest._serverRetryCount || 0) + 1;
      
      console.log(`Server error, retrying (${originalRequest._serverRetryCount}/2):`, originalRequest.url);
      
      // Wait before retrying server errors
      await new Promise(resolve => setTimeout(resolve, 2000 * originalRequest._serverRetryCount));
      return api(originalRequest);
    }

    // Log errors in development
    const normalizedError = normalizeApiError(error);
    error.normalizedError = normalizedError;

    if (import.meta.env.DEV) {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: normalizedError.status,
        code: normalizedError.code,
        message: normalizedError.message,
        data: error.response?.data,
        requestId: normalizedError.requestId
      });
    }

    return Promise.reject(error);
  }
);

// Utility function to preload critical data
export const preloadCriticalData = async () => {
  try {
    // Preload user data if authenticated
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (token) {
      await api.get('/auth/me');
    }
  } catch (error) {
    console.log('Preload failed:', error.message);
  }
};

// Health check function
export const checkApiHealth = async () => {
  try {
    const response = await api.get('/health/status', { timeout: 5000 });
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error.message);
    return { status: 'error', message: error.message };
  }
};

export default api;