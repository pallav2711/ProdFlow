/**
 * ProdFlow AI - Cluster Manager for Production Performance
 * Utilizes all CPU cores for maximum throughput
 */

const cluster = require('cluster');
const os = require('os');
const path = require('path');

// Number of CPU cores
const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`🚀 Master process ${process.pid} is running`);
  console.log(`💻 CPU cores available: ${numCPUs}`);
  console.log(`🔧 Starting ${numCPUs} worker processes...`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();
    console.log(`👷 Worker ${worker.process.pid} started`);
  }

  // Handle worker exit
  cluster.on('exit', (worker, code, signal) => {
    console.log(`💀 Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
    console.log('🔄 Starting a new worker...');
    const newWorker = cluster.fork();
    console.log(`👷 New worker ${newWorker.process.pid} started`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 Master received SIGTERM, shutting down gracefully...');
    
    for (const id in cluster.workers) {
      cluster.workers[id].kill();
    }
    
    setTimeout(() => {
      console.log('💀 Forcing shutdown...');
      process.exit(0);
    }, 10000);
  });

  // Performance monitoring
  setInterval(() => {
    const workers = Object.keys(cluster.workers).length;
    const memory = process.memoryUsage();
    
    console.log(`📊 Cluster Status: ${workers} workers, Memory: ${Math.round(memory.rss / 1024 / 1024)}MB`);
  }, 30000); // Every 30 seconds

} else {
  // Worker process
  require('./server.js');
  
  console.log(`👷 Worker ${process.pid} started and listening`);
  
  // Graceful shutdown for workers
  process.on('SIGTERM', () => {
    console.log(`🛑 Worker ${process.pid} received SIGTERM, shutting down gracefully...`);
    process.exit(0);
  });
}