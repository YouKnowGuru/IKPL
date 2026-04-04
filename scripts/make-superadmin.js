const mongoose = require('mongoose');

async function makeSuperAdmin() {
  const MONGODB_URI = "mongodb://indrakausilaprivatelimitedcomp_db_user:DvcSojazoobSCY11@ac-kncfldt-shard-00-00.k70da2j.mongodb.net:27017,ac-kncfldt-shard-00-01.k70da2j.mongodb.net:27017,ac-kncfldt-shard-00-02.k70da2j.mongodb.net:27017/feed-platform?ssl=true&replicaSet=atlas-s7r5v8-shard-0&authSource=admin&appName=Cluster0";
  const email = "indrakausilaprivatelimitedcomp@gmail.com";

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const UserSchema = new mongoose.Schema({
      email: String,
      role: String,
      isEmailVerified: Boolean
    });

    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    const result = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role: 'super_admin', isEmailVerified: true },
      { new: true }
    );

    if (result) {
      console.log(`Success! User ${email} is now a super_admin.`);
      console.log(result);
    } else {
      console.log(`User ${email} not found.`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

makeSuperAdmin();
