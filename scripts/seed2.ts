import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import { User, Location, Category, Product } from '../models';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env.local');
  process.exit(1);
}

const bhutanDistricts = [
  'Bumthang', 'Chukha', 'Dagana', 'Gasa', 'Haa', 'Lhuntse', 'Mongar', 'Paro',
  'Pemagatshel', 'Punakha', 'Samdrup Jongkhar', 'Samtse', 'Sarpang', 'Thimphu',
  'Trashigang', 'Trashiyangtse', 'Trongsa', 'Tsirang', 'Wangdue Phodrang', 'Zhemgang'
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected.');

    console.log('Clearing old data (Locations, Categories, Inventory)...');
    await Location.deleteMany({});
    await Category.deleteMany({});
    
    // Seed Districts
    console.log(`Seeding ${bhutanDistricts.length} districts...`);
    const locations = await Promise.all(
       bhutanDistricts.map(dict => 
          Location.create({
             name: `${dict} Feed Store`,
             district: dict,
             address: `Main City Center, ${dict}`,
             isActive: true
          })
       )
    );
    console.log('Districts seeded.');

    // Seed Categories
    console.log('Seeding Categories...');
    const catLabels = ['Poultry Feed', 'Pig Feed', 'Cattle Feed', 'Fish Feed'];
    await Promise.all(
       catLabels.map(label => 
          Category.create({
             name: label,
             slug: label.toLowerCase().replace(' ', '-')
          })
       )
    );
    console.log('Categories seeded.');

    // Seed Super Admin if not exists
    console.log('Checking Super Admin...');
    const existingAdmin = await User.findOne({ email: 'admin@ikpl.com' });
    if (!existingAdmin) {
       await User.create({
          name: 'Super Admin',
          email: 'admin@ikpl.com',
          password: 'password123',
          role: 'super_admin'
       });
       console.log('Super Admin created: admin@ikpl.com / password123');
    } else {
       if (existingAdmin.role !== 'super_admin') {
          existingAdmin.role = 'super_admin';
          await existingAdmin.save();
          console.log('Updated existing admin to super_admin.');
       } else {
          console.log('Super Admin already exists.');
       }
    }

    console.log('\n--- SEED COMPLETE ---');
    console.log('You can now log in with: admin@ikpl.com / password123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
