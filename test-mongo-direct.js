// test-mongo-direct.js
const mongoose = require('mongoose');

// Load environment variables from .env.local if present
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  // Try to continue even if dotenv isn't installed
}

const uri = "mongodb://indrakausilaprivatelimitedcomp_db_user:DvcSojazoobSCY11@ac-kncfldt-shard-00-00.k70da2j.mongodb.net:27017,ac-kncfldt-shard-00-01.k70da2j.mongodb.net:27017,ac-kncfldt-shard-00-02.k70da2j.mongodb.net:27017/?ssl=true&replicaSet=atlas-s7r5v8-shard-0&authSource=admin&appName=Cluster0";

console.log('🔄 Attempting direct connection to MongoDB Atlas (No SRV lookup)...');

const opts = {
  serverSelectionTimeoutMS: 5000,
  family: 4 // Force IPv4, as Node 17+ sometimes tries IPv6 which can fail on Mongo
};

async function testConnection() {
  try {
    await mongoose.connect(uri, opts);
    console.log('✅ Successfully connected to MongoDB directly!');
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB. Detailed Server Error:');
    if (error.reason && error.reason.servers) {
      error.reason.servers.forEach((desc, address) => {
        console.error(`- Server ${address} error:`, desc.error ? desc.error.message : 'Unknown error');
      });
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

testConnection();
