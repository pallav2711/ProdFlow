/**
 * Connection Test Utilities
 * Tests all system connections and provides diagnostics
 */

import api, { checkApiHealth } from '../api/config';

// Test CORS configuration
export const testCorsConfiguration = async () => {
  try {
    const response = await api.get('/cors-test', { timeout: 5000 });
    return {
      success: true,
      status: 'cors_working',
      data: response.data,
      headers: response.headers
    };
  } catch (error) {
    return {
      success: false,
      status: 'cors_failed',
      error: error.message,
      code: error.code,
      response: error.response?.data
    };
  }
};

// Test API connection
export const testApiConnection = async () => {
  try {
    const response = await api.get('/health', { timeout: 5000 });
    return {
      success: true,
      status: 'connected',
      data: response.data,
      latency: response.config.metadata ? Date.now() - response.config.metadata.startTime : null
    };
  } catch (error) {
    return {
      success: false,
      status: 'disconnected',
      error: error.message,
      code: error.code
    };
  }
};

// Test authentication flow
export const testAuthFlow = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return {
      success: true,
      status: 'authenticated',
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      status: 'authentication_failed',
      error: error.response?.data?.message || error.message
    };
  }
};

// Test protected endpoints
export const testProtectedEndpoints = async () => {
  const endpoints = [
    { name: 'Products', url: '/products' },
    { name: 'Sprints', url: '/sprints' },
    { name: 'My Tasks', url: '/sprints/my-tasks' },
    { name: 'Teams', url: '/teams/invitations' }
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      const response = await api.get(endpoint.url, { timeout: 10000 });
      results.push({
        name: endpoint.name,
        url: endpoint.url,
        success: true,
        status: response.status,
        data: response.data
      });
    } catch (error) {
      results.push({
        name: endpoint.name,
        url: endpoint.url,
        success: false,
        status: error.response?.status,
        error: error.response?.data?.message || error.message
      });
    }
  }

  return results;
};

// Comprehensive system test
export const runSystemDiagnostics = async () => {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    tests: {}
  };

  // Test CORS configuration
  console.log('Testing CORS configuration...');
  diagnostics.tests.cors = await testCorsConfiguration();

  // Test API health
  console.log('Testing API health...');
  diagnostics.tests.apiHealth = await checkApiHealth();

  // Test basic connection
  console.log('Testing API connection...');
  diagnostics.tests.apiConnection = await testApiConnection();

  // Test environment variables
  console.log('Checking environment configuration...');
  diagnostics.tests.environment = {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    nodeEnv: import.meta.env.VITE_NODE_ENV,
    aiServiceUrl: import.meta.env.VITE_AI_SERVICE_URL,
    enableAI: import.meta.env.VITE_ENABLE_AI_PREDICTIONS
  };

  // Test browser capabilities
  console.log('Testing browser capabilities...');
  diagnostics.tests.browser = {
    localStorage: typeof Storage !== 'undefined',
    sessionStorage: typeof sessionStorage !== 'undefined',
    fetch: typeof fetch !== 'undefined',
    webSocket: typeof WebSocket !== 'undefined',
    userAgent: navigator.userAgent,
    online: navigator.onLine
  };

  // Test authentication state
  console.log('Checking authentication state...');
  diagnostics.tests.auth = {
    hasAccessToken: !!localStorage.getItem('accessToken'),
    hasRefreshToken: !!localStorage.getItem('refreshToken'),
    hasOldToken: !!(localStorage.getItem('token') || sessionStorage.getItem('token')),
    rememberMe: localStorage.getItem('rememberMe')
  };

  return diagnostics;
};

// Network quality test
export const testNetworkQuality = async () => {
  const tests = [];
  const testCount = 5;

  for (let i = 0; i < testCount; i++) {
    const startTime = Date.now();
    try {
      await api.get('/health/ping', { timeout: 5000 });
      const latency = Date.now() - startTime;
      tests.push({ success: true, latency });
    } catch (error) {
      tests.push({ success: false, error: error.message });
    }
  }

  const successfulTests = tests.filter(t => t.success);
  const averageLatency = successfulTests.length > 0 
    ? successfulTests.reduce((sum, t) => sum + t.latency, 0) / successfulTests.length 
    : null;

  return {
    totalTests: testCount,
    successfulTests: successfulTests.length,
    failedTests: tests.length - successfulTests.length,
    successRate: (successfulTests.length / testCount) * 100,
    averageLatency,
    minLatency: successfulTests.length > 0 ? Math.min(...successfulTests.map(t => t.latency)) : null,
    maxLatency: successfulTests.length > 0 ? Math.max(...successfulTests.map(t => t.latency)) : null,
    tests
  };
};

// Export all test functions
export default {
  testCorsConfiguration,
  testApiConnection,
  testAuthFlow,
  testProtectedEndpoints,
  runSystemDiagnostics,
  testNetworkQuality
};