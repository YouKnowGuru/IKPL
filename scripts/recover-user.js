// scripts/recover-user.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = "mongodb://indrakausilaprivatelimitedcomp_db_user:DvcSojazoobSCY11@ac-kncfldt-shard-00-00.k70da2j.mongodb.net:27017,ac-kncfldt-shard-00-01.k70da2j.mongodb.net:27017,ac-kncfldt-shard-00-02.k70da2j.mongodb.net:27017/feed-platform?ssl=true&replicaSet=atlas-s7r5v8-shard-0&authSource=admin&appName=Cluster0";
const email = "mcsgang5@gmail.com";
const newPassword = "mcsgang5@gmail.com";

async function recoverUser() {
  try {
    console.log(`🔄 Connecting to MongoDB to recover ${email}...`);
    await mongoose.connect(uri, { family: 4 });
    
    // We'll use the native driver to update the user to avoid Mongoose schema issues
    const db = mongoose.connection.db;
    const users = db.collection('users');
    
    // Hash the password
    console.log(`🔐 Hashing password...`);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the user using $set to avoid overwriting the whole document
    console.log(`📝 Updating user...`);
    const result = await users.updateOne(
      { email: email.toLowerCase() },
      { 
        $set: { 
          password: hashedPassword,
          role: 'admin'
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      console.error(`❌ User with email ${email} not found.`);
    } else {
      console.log(`✅ Success! User ${email} password and role updated.`);
      console.log(`Result:`, result);
    }
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error recovering user:', error);
    process.exit(1);
  }
}

recoverUser();
