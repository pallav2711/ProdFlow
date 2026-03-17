/**
 * ProdFlow AI - Performance Monitoring Script
 * Monitors and reports performance metrics for all services
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Service endpoints
const SERVICES = {
  frontend: 'https://prodflowaii.vercel.app',
  backend: 'https://prodflow-6rmm.onrender.com',
  ai: 'https://prodflow-2w53.onrender.com'
};

// Performance thresholds (in milliseconds)
const THRESHOLDS = {
  excellent: 500,
  good: 1000,
  acceptable: 2000,
  poor: 5000
};

async function measureResponseTime(url, endpoint = '') {
  const fullUrl = `${url}${endpoint}`;
  const startTime = Date.now();
  
  try {
    const response = await axios.get(fullUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'ProdFlow-Performance-Monitor/1.0'
      }
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    return {
      url: fullUrl,
      status: response.status,
      responseTime,
      success: true,
      size: JSON.stringify(response.data).length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    return {
      url: fullUrl,
      status: error.response?.status || 0,
      responseTime,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

function getPerformanceRating(responseTime) {
  if (responseTime <= THRESHOLDS.excellent) return 'Excellent';
  if (responseTime <= THRESHOLDS.good) return 'Good';
  if (responseTime <= THRESHOLDS.acceptable) return 'Acceptable';
  if (responseTime <= THRESHOLDS.poor) return 'Poor';
  return 'Critical';
}

function formatResponseTime(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

async function runPerformanceTest() {
  console.log('🚀 Starting ProdFlow AI Performance Test...\n');
  
  const results = {
    timestamp: new Date().toISOString(),
    services: {},
    summary: {
      totalTests: 0,
      passed: 0,
      failed: 0,
      averageResponseTime: 0
    }
  };
  
  // Test endpoints for each service
  const testEndpoints = {
    frontend: [
      { path: '/', name: 'Landing Page' },
      { path: '/login', name: 'Login Page' }
    ],
    backend: [
      { path: '/api/health', name: 'Health Check' },
      { path: '/ping', name: 'Ping' }
    ],
    ai: [
      { path: '/health', name: 'AI Health Check' },
      { path: '/ping', name: 'AI Ping' },
      { path: '/', name: 'AI Root' }
    ]
  };
  
  let totalResponseTime = 0;
  let totalTests = 0;
  
  for (const [serviceName, serviceUrl] of Object.entries(SERVICES)) {
    console.log(`📊 Testing ${serviceName.toUpperCase()} (${serviceUrl})`);
    
    results.services[serviceName] = {
      url: serviceUrl,
      endpoints: {},
      averageResponseTime: 0,
      status: 'unknown'
    };
    
    const endpoints = testEndpoints[serviceName] || [{ path: '', name: 'Root' }];
    let serviceResponseTimes = [];
    
    for (const endpoint of endpoints) {
      const result = await measureResponseTime(serviceUrl, endpoint.path);
      const rating = getPerformanceRating(result.responseTime);
      
      results.services[serviceName].endpoints[endpoint.name] = result;
      serviceResponseTimes.push(result.responseTime);
      totalResponseTime += result.responseTime;
      totalTests++;
      
      const statusIcon = result.success ? '✅' : '❌';
      const ratingColor = rating === 'Excellent' ? '🟢' : 
                         rating === 'Good' ? '🟡' : 
                         rating === 'Acceptable' ? '🟠' : '🔴';
      
      console.log(`  ${statusIcon} ${endpoint.name}: ${formatResponseTime(result.responseTime)} ${ratingColor} ${rating}`);
      
      if (result.success) {
        results.summary.passed++;
      } else {
        results.summary.failed++;
        console.log(`    Error: ${result.error}`);
      }
    }
    
    // Calculate service average
    const serviceAvg = serviceResponseTimes.reduce((a, b) => a + b, 0) / serviceResponseTimes.length;
    results.services[serviceName].averageResponseTime = serviceAvg;
    results.services[serviceName].status = serviceResponseTimes.every(t => t < THRESHOLDS.poor) ? 'healthy' : 'degraded';
    
    console.log(`  📈 Average: ${formatResponseTime(serviceAvg)} (${getPerformanceRating(serviceAvg)})\n`);
  }
  
  // Calculate overall summary
  results.summary.totalTests = totalTests;
  results.summary.averageResponseTime = totalResponseTime / totalTests;
  
  // Display summary
  console.log('📋 PERFORMANCE SUMMARY');
  console.log('=' * 50);
  console.log(`Total Tests: ${results.summary.totalTests}`);
  console.log(`Passed: ${results.summary.passed} ✅`);
  console.log(`Failed: ${results.summary.failed} ❌`);
  console.log(`Overall Average: ${formatResponseTime(results.summary.averageResponseTime)} (${getPerformanceRating(results.summary.averageResponseTime)})`);
  
  // Performance recommendations
  console.log('\n💡 PERFORMANCE RECOMMENDATIONS:');
  
  for (const [serviceName, serviceData] of Object.entries(results.services)) {
    const avgTime = serviceData.averageResponseTime;
    
    if (avgTime > THRESHOLDS.poor) {
      console.log(`🔴 ${serviceName.toUpperCase()}: Critical performance issues detected`);
      console.log(`   - Consider upgrading hosting plan or optimizing code`);
    } else if (avgTime > THRESHOLDS.acceptable) {
      console.log(`🟠 ${serviceName.toUpperCase()}: Performance could be improved`);
      console.log(`   - Review caching strategies and optimize database queries`);
    } else if (avgTime > THRESHOLDS.good) {
      console.log(`🟡 ${serviceName.toUpperCase()}: Good performance, minor optimizations possible`);
    } else {
      console.log(`🟢 ${serviceName.toUpperCase()}: Excellent performance!`);
    }
  }
  
  // Save results to file
  const resultsFile = path.join(__dirname, 'performance-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  console.log(`\n📄 Detailed results saved to: ${resultsFile}`);
  
  return results;
}

// Run the performance test
if (require.main === module) {
  runPerformanceTest()
    .then(() => {
      console.log('\n✅ Performance test completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Performance test failed:', error);
      process.exit(1);
    });
}

module.exports = { runPerformanceTest, measureResponseTime, getPerformanceRating };