/**
 * Environment Variables Test Script
 * Run this to debug environment variable loading
 */

const dotenv = require('dotenv');
const path = require('path');

console.log('🔧 Testing Environment Variable Loading...\n');

// Test 1: Load from current directory
console.log('Test 1: Loading from current directory');
const result1 = dotenv.config();
console.log('Result:', result1.error ? `Error: ${result1.error}` : 'Success');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('');

// Test 2: Load from explicit path
console.log('Test 2: Loading from explicit path');
const envPath = path.join(__dirname, '.env');
console.log('Path:', envPath);
const result2 = dotenv.config({ path: envPath });
console.log('Result:', result2.error ? `Error: ${result2.error}` : 'Success');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('');

// Test 3: Check if .env file exists
const fs = require('fs');
console.log('Test 3: File existence check');
console.log('.env exists:', fs.existsSync(envPath));
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  console.log('File size:', content.length, 'bytes');
  console.log('Contains MONGODB_URI:', content.includes('MONGODB_URI'));
}
console.log('');

// Test 4: Show all environment variables
console.log('Test 4: All loaded environment variables');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET (length: ' + process.env.MONGODB_URI.length + ')' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('AI_SERVICE_URL:', process.env.AI_SERVICE_URL);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

console.log('\n✅ Environment test complete');