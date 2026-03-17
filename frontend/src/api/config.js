import axios from 'axios';

// Create axios instance with optimized configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 15000, // Increased timeout for free hosting
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br', // Enable compression
  },
  // Enable request/response compression
  decompress: true,
  // Connection keep-alive for better performance
  maxRedirects: 3,
  // Retry configuration for unreliable free hosting
  validateStatus: (status) => status < 500, // Don't throw on 4xx errors
});

// Request cache for GET requests to reduce API calls
const requestCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Add request interceptor with caching and optimization
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

    // Implement simple caching for GET requests
    if (config.method === 'get') {
      const cacheKey = `${config.url}${JSON.stringify(config.params || {})}`;
      const cachedResponse = requestCache.get(cacheKey);
      
      if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_DURATION) {
        // Return cached response
        return Promise.resolve(cachedResponse.data);
      }
    }

    // Add request timestamp for performance monitoring
    config.metadata = { startTime: Date.now() };
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor with caching and error handling
api.interceptors.response.use(
  (response) => {
    // Log response time in development
    if (import.meta.env.DEV && response.config.metadata) {
      const duration = Date.now() - response.config.metadata.startTime;
      console.log(`API ${response.config.method?.toUpperCase()} ${response.config.url}: ${duration}ms`);
    }

    // Cache successful GET responses
    if (response.config.method === 'get' && response.status === 200) {
      const cacheKey = `${response.config.url}${JSON.stringify(response.config.params || {})}`;
      requestCache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      });
      
      // Clean old cache entries
      if (requestCache.size > 50) {
        const oldestKey = requestCache.keys().next().value;
        requestCache.delete(oldestKey);
      }
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors with retry logic for free hosting
    if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
      if (!originalRequest._retry && originalRequest._retryCount < 2) {
        originalRequest._retry = true;
        originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
        
        console.log(`Retrying request (${originalRequest._retryCount}/2):`, originalRequest.url);
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * originalRequest._retryCount));
        
        return api(originalRequest);
      }
    }

    // Handle 401 errors (authentication)
    if (error.response?.status === 401) {
      // Clear tokens and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Handle 429 (rate limiting) with exponential backoff
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 1;
      console.log(`Rate limited. Retrying after ${retryAfter} seconds...`);
      
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return api(originalRequest);
    }

    // Log errors in development
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
    }

    return Promise.reject(error);
  }
);

// Utility function to clear cache
export const clearApiCache = () => {
  requestCache.clear();
  console.log('API cache cleared');
};

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

export default api;