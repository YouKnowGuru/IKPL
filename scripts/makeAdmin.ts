import mongoose from 'mongoose';
import { User } from '../models'; // Adjust path if needed

const uri = "mongodb://indrakausilaprivatelimitedcomp_db_user:DvcSojazoobSCY11@ac-kncfldt-shard-00-00.k70da2j.mongodb.net:27017,ac-kncfldt-shard-00-01.k70da2j.mongodb.net:27017,ac-kncfldt-shard-00-02.k70da2j.mongodb.net:27017/feed-platform?ssl=true&replicaSet=atlas-s7r5v8-shard-0&authSource=admin&appName=Cluster0";

async function makeAdmin() {
  await mongoose.connect(uri);
  const user = await User.findOneAndUpdate(
    { email: 'indrakausilaprivatelimitedcomp@gmail.com' },
    { role: 'super_admin' },
    { new: true }
  );

  if (user) {
    console.log('Successfully updated user to super_admin:', user.email);
  } else {
    console.log('User not found.');
  }

  process.exit(0);
}

makeAdmin().catch(console.error);
