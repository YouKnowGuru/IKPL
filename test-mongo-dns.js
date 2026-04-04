// test-mongo-dns.js
const dns = require('dns');
const mongoose = require('mongoose');

// Force Node.js to use Google's Public DNS (8.8.8.8 and 8.8.4.4)
dns.setServers(['8.8.8.8', '8.8.4.4']);
console.log('🌐 Forced Node.js DNS resolution to Google Public DNS...');

// Load environment variables from .env.local if present
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  // Try to continue even if dotenv isn't installed
}

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI is not defined in your environment or .env.local file');
  process.exit(1);
}

const opts = {
  // Setting a shorter timeout for the test script
  serverSelectionTimeoutMS: 5000, 
};

async function testConnection() {
  console.log('🔄 Attempting to connect to MongoDB Atlas...');
  try {
    await mongoose.connect(uri, opts);
    console.log('✅ Successfully connected to MongoDB through Google DNS!');
    
    // Disconnect so the script exits gracefully
    await mongoose.disconnect();
    console.log('🔌 Disconnected successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:');
    console.error(error);
    process.exit(1);
  }
}

testConnection();
