/**
 * MongoDB Database Connection with Performance Optimizations
 * Uses Mongoose for ODM (Object Data Modeling)
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Debug: Check if MONGODB_URI is loaded
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI environment variable is not set');
      console.log('Available environment variables:');
      console.log('- NODE_ENV:', process.env.NODE_ENV);
      console.log('- PORT:', process.env.PORT);
      console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
      process.exit(1);
    }

    console.log('🔗 Connecting to MongoDB...');
    console.log('📍 Database URI:', process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));

    // Optimized connection options for performance
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      
      // Connection pool settings for better performance
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 2,  // Minimum number of connections in the pool
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      serverSelectionTimeoutMS: 5000, // How long to try selecting a server
      socketTimeoutMS: 45000, // How long to wait for a response
      
      // Buffering settings (updated for newer MongoDB driver)
      bufferCommands: false, // Disable mongoose buffering
      
      // Heartbeat settings
      heartbeatFrequencyMS: 10000, // How often to check server status
      
      // Compression for network efficiency
      compressors: ['zlib'],
      zlibCompressionLevel: 6,
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
    console.log(`🔧 Connection Pool Size: ${options.maxPoolSize}`);
    console.log(`📦 Compression Enabled: zlib`);

    // Connection event listeners for monitoring
    mongoose.connection.on('connected', () => {
      console.log('📡 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📡 Mongoose disconnected from MongoDB');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('📡 Mongoose connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('Full error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
