// scripts/check-user.js
const mongoose = require('mongoose');

const uri = "mongodb://indrakausilaprivatelimitedcomp_db_user:DvcSojazoobSCY11@ac-kncfldt-shard-00-00.k70da2j.mongodb.net:27017,ac-kncfldt-shard-00-01.k70da2j.mongodb.net:27017,ac-kncfldt-shard-00-02.k70da2j.mongodb.net:27017/feed-platform?ssl=true&replicaSet=atlas-s7r5v8-shard-0&authSource=admin&appName=Cluster0";
const email = "mcsgang5@gmail.com";

async function checkUser() {
  try {
    await mongoose.connect(uri, { family: 4 });
    const db = mongoose.connection.db;
    const user = await db.collection('users').findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('User not found');
    } else {
      console.log('User found:', JSON.stringify(user, null, 2));
      console.log('Has password field:', !!user.password);
    }
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkUser();
