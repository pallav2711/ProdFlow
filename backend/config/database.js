/**
 * MongoDB Database Connection with Advanced Performance Optimizations
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

    // Production-optimized connection options
    const options = {
      // Connection pool settings for high performance
      maxPoolSize: process.env.NODE_ENV === 'production' ? 20 : 10, // Maximum connections
      minPoolSize: process.env.NODE_ENV === 'production' ? 5 : 2,   // Minimum connections
      maxIdleTimeMS: 30000,     // Close connections after 30 seconds of inactivity
      serverSelectionTimeoutMS: 5000, // How long to try selecting a server
      socketTimeoutMS: 45000,   // How long a send or receive can take before timing out
      
      // Performance optimizations
      bufferCommands: false,    // Disable mongoose buffering
      
      // Compression for better network performance
      compressors: ['zlib'],
      zlibCompressionLevel: 6,
      
      // Write concern for better performance (adjust based on needs)
      writeConcern: {
        w: process.env.NODE_ENV === 'production' ? 'majority' : 1,
        j: true, // Wait for journal
        wtimeout: 10000 // 10 second timeout
      },
      
      // Read preference for better performance
      readPreference: 'primaryPreferred',
      
      // Connection management
      heartbeatFrequencyMS: 10000, // How often to check server status
      retryWrites: true,
      retryReads: true,
      
      // Additional performance settings
      autoIndex: process.env.NODE_ENV !== 'production', // Disable in production
      autoCreate: process.env.NODE_ENV !== 'production', // Disable in production
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

    // Performance monitoring in development
    if (process.env.NODE_ENV === 'development') {
      mongoose.set('debug', (collectionName, method, query, doc) => {
        console.log(`🔍 MongoDB Query: ${collectionName}.${method}`, JSON.stringify(query));
      });
    }

    // Set mongoose options for better performance
    mongoose.set('strictQuery', true);
    mongoose.set('sanitizeFilter', true);
    // Configure mongoose buffering (this is the correct way for newer versions)
    mongoose.set('bufferCommands', false);
    mongoose.set('bufferMaxEntries', 0);

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('📡 Mongoose connection closed through app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('Full error:', error);
    
    // Retry connection after delay in production
    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Retrying connection in 5 seconds...');
      setTimeout(connectDB, 5000);
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
