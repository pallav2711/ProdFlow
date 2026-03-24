import axios from 'axios';

// Create axios instance with production-optimized configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 30000, // Increased timeout for production
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Performance optimizations
  decompress: true,
  maxRedirects: 3,
  validateStatus: (status) => status < 500,
  // Connection pooling
  maxContentLength: 50 * 1024 * 1024, // 50MB
  maxBodyLength: 50 * 1024 * 1024, // 50MB
});

// Advanced caching system with TTL and size limits
class APICache {
  constructor(maxSize = 100, defaultTTL = 5 * 60 * 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    this.accessOrder = new Map(); // For LRU eviction
  }

  generateKey(config) {
    const { method, url, params, data } = config;
    return `${method}:${url}:${JSON.stringify(params || {})}:${JSON.stringify(data || {})}`;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      this.accessOrder.delete(key);
      return null;
    }

    // Update access order for LRU
    this.accessOrder.delete(key);
    this.accessOrder.set(key, Date.now());
    
    return item.data;
  }

  set(key, data, ttl = this.defaultTTL) {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.accessOrder.keys().next().value;
      this.cache.delete(oldestKey);
      this.accessOrder.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
      created: Date.now()
    });
    this.accessOrder.set(key, Date.now());
  }

  clear() {
    this.cache.clear();
    this.accessOrder.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.hitCount / (this.hitCount + this.missCount) || 0
    };
  }
}

// Initialize cache
const apiCache = new APICache(200, 3 * 60 * 1000); // 200 items, 3 minute TTL

// Request deduplication to prevent duplicate requests
const pendingRequests = new Map();

// Add request interceptor with advanced optimizations
api.interceptors.request.use(
  async (config) => {
    // Add auth token
    const accessToken = localStorage.getItem('accessToken');
    const oldToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else if (oldToken) {
      config.headers.Authorization = `Bearer ${oldToken}`;
    }

    // Request deduplication for GET requests
    if (config.method === 'get') {
      const requestKey = apiCache.generateKey(config);
      
      // Check if same request is already pending
      if (pendingRequests.has(requestKey)) {
        return pendingRequests.get(requestKey);
      }

      // Check cache first
      const cachedResponse = apiCache.get(requestKey);
      if (cachedResponse) {
        console.log(`🎯 Cache hit for ${config.url}`);
        return Promise.resolve(cachedResponse);
      }

      // Store pending request
      const requestPromise = axios(config);
      pendingRequests.set(requestKey, requestPromise);
      
      // Clean up pending request when done
      requestPromise.finally(() => {
        pendingRequests.delete(requestKey);
      });
    }

    // Add request timestamp for performance monitoring
    config.metadata = { startTime: Date.now() };
    
    // Add request ID for tracking
    config.headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor with advanced caching and error handling
api.interceptors.response.use(
  (response) => {
    // Log response time in development
    if (import.meta.env.DEV && response.config.metadata) {
      const duration = Date.now() - response.config.metadata.startTime;
      console.log(`🚀 API ${response.config.method?.toUpperCase()} ${response.config.url}: ${duration}ms`);
    }

    // Cache successful GET responses
    if (response.config.method === 'get' && response.status === 200) {
      const cacheKey = apiCache.generateKey(response.config);
      
      // Determine TTL based on endpoint
      let ttl = 3 * 60 * 1000; // Default 3 minutes
      
      if (response.config.url.includes('/auth/me')) {
        ttl = 10 * 60 * 1000; // User data: 10 minutes
      } else if (response.config.url.includes('/products')) {
        ttl = 5 * 60 * 1000; // Products: 5 minutes
      } else if (response.config.url.includes('/sprints')) {
        ttl = 2 * 60 * 1000; // Sprints: 2 minutes (more dynamic)
      } else if (response.config.url.includes('/tasks')) {
        ttl = 1 * 60 * 1000; // Tasks: 1 minute (very dynamic)
      }
      
      apiCache.set(cacheKey, response, ttl);
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Enhanced retry logic with exponential backoff
    if (shouldRetry(error) && !originalRequest._retry) {
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      
      if (originalRequest._retryCount <= 3) {
        console.log(`🔄 Retrying request (${originalRequest._retryCount}/3):`, originalRequest.url);
        
        // Exponential backoff with jitter
        const delay = Math.min(1000 * Math.pow(2, originalRequest._retryCount - 1), 10000);
        const jitter = Math.random() * 0.1 * delay;
        
        await new Promise(resolve => setTimeout(resolve, delay + jitter));
        
        return api(originalRequest);
      }
    }

    // Handle 401 errors (authentication)
    if (error.response?.status === 401) {
      // Clear tokens and cache
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      apiCache.clear();
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Handle 429 (rate limiting) with exponential backoff
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 1;
      console.log(`⏳ Rate limited. Retrying after ${retryAfter} seconds...`);
      
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return api(originalRequest);
    }

    // Log errors in development
    if (import.meta.env.DEV) {
      console.error('🚨 API Error:', {
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

// Helper function to determine if request should be retried
function shouldRetry(error) {
  // Retry on network errors, timeouts, and 5xx errors
  return (
    error.code === 'NETWORK_ERROR' ||
    error.code === 'ECONNABORTED' ||
    error.code === 'ETIMEDOUT' ||
    (error.response && error.response.status >= 500)
  );
}

// Utility functions
export const clearApiCache = () => {
  apiCache.clear();
  pendingRequests.clear();
  console.log('🧹 API cache cleared');
};

export const getCacheStats = () => {
  return apiCache.getStats();
};

export const preloadCriticalData = async () => {
  try {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (token) {
      // Preload user data
      await api.get('/auth/me');
      console.log('✅ Critical data preloaded');
    }
  } catch (error) {
    console.log('⚠️ Preload failed:', error.message);
  }
};

// Performance monitoring
if (import.meta.env.DEV) {
  // Log cache stats periodically
  setInterval(() => {
    const stats = getCacheStats();
    if (stats.size > 0) {
      console.log('📊 Cache Stats:', stats);
    }
  }, 60000); // Every minute
}

export default api;