import mongoose from 'mongoose';

const uri = "mongodb://indrakausilaprivatelimitedcomp_db_user:DvcSojazoobSCY11@ac-kncfldt-shard-00-00.k70da2j.mongodb.net:27017,ac-kncfldt-shard-00-01.k70da2j.mongodb.net:27017,ac-kncfldt-shard-00-02.k70da2j.mongodb.net:27017/feed-platform?ssl=true&replicaSet=atlas-s7r5v8-shard-0&authSource=admin&appName=Cluster0";

async function makeAdmin() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const result = await db.collection('users').updateOne(
    { email: 'indrakausilaprivatelimitedcomp@gmail.com' },
    { $set: { role: 'super_admin' } }
  );
  console.log('Update result:', result);
  process.exit(0);
}

makeAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});
