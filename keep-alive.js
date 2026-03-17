/**
 * ProdFlow AI - Keep-Alive Script
 * Prevents free hosting services from going to sleep
 */

const axios = require('axios');

// Services to keep alive
const SERVICES = [
  {
    name: 'Backend API',
    url: 'https://prodflow-6rmm.onrender.com/api/health',
    interval: 14 * 60 * 1000 // 14 minutes
  },
  {
    name: 'AI Service',
    url: 'https://prodflow-2w53.onrender.com/ping',
    interval: 14 * 60 * 1000 // 14 minutes
  }
];

async function pingService(service) {
  try {
    const startTime = Date.now();
    const response = await axios.get(service.url, {
      timeout: 30000,
      headers: {
        'User-Agent': 'ProdFlow-KeepAlive/1.0'
      }
    });
    
    const responseTime = Date.now() - startTime;
    const timestamp = new Date().toISOString();
    
    console.log(`✅ [${timestamp}] ${service.name}: ${responseTime}ms (Status: ${response.status})`);
    
    return { success: true, responseTime, status: response.status };
  } catch (error) {
    const timestamp = new Date().toISOString();
    console.log(`❌ [${timestamp}] ${service.name}: ${error.message}`);
    
    return { success: false, error: error.message };
  }
}

function startKeepAlive() {
  console.log('🔄 Starting ProdFlow AI Keep-Alive Service...\n');
  
  // Initial ping for all services
  SERVICES.forEach(service => {
    console.log(`🎯 Monitoring ${service.name} every ${service.interval / 60000} minutes`);
    
    // Ping immediately
    pingService(service);
    
    // Set up interval
    setInterval(() => {
      pingService(service);
    }, service.interval);
  });
  
  console.log('\n✅ Keep-alive service started successfully!');
  console.log('📊 Services will be pinged every 14 minutes to prevent sleep.\n');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Keep-alive service shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Keep-alive service shutting down...');
  process.exit(0);
});

// Start the keep-alive service
if (require.main === module) {
  startKeepAlive();
}

module.exports = { pingService, startKeepAlive };