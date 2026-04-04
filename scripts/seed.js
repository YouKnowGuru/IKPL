const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/feed-distribution';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Define schemas
    const UserSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
      createdAt: { type: Date, default: Date.now },
    });

    const ProductSchema = new mongoose.Schema({
      name: String,
      category: { type: String, enum: ['broiler', 'layer', 'pig', 'cattle', 'fish', 'other'] },
      description: String,
      nutrients: {
        protein: Number,
        fat: Number,
        fiber: Number,
        moisture: Number,
      },
      price: Number,
      stock: Number,
      image: String,
      createdAt: { type: Date, default: Date.now },
    });

    const ContentSchema = new mongoose.Schema({
      key: { type: String, unique: true },
      title: String,
      value: String,
      updatedAt: { type: Date, default: Date.now },
    });

    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
    const Content = mongoose.models.Content || mongoose.model('Content', ContentSchema);

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Content.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@agrofeed.com',
      password: adminPassword,
      role: 'admin',
    });
    console.log('Created admin user:', admin.email);

    // Create sample customer
    const customerPassword = await bcrypt.hash('customer123', 10);
    const customer = await User.create({
      name: 'John Customer',
      email: 'customer@example.com',
      password: customerPassword,
      role: 'customer',
    });
    console.log('Created customer user:', customer.email);

    // Create sample products
    const products = [
      {
        name: 'Premium Broiler Feed',
        category: 'broiler',
        description: 'High-protein feed specially formulated for broiler chickens. Contains essential amino acids, vitamins, and minerals for optimal growth and meat production.',
        nutrients: { protein: 22, fat: 5, fiber: 4, moisture: 12 },
        price: 25.99,
        stock: 150,
        image: 'https://images.unsplash.com/photo-1589923188651-268a9765e432?w=600&q=80',
      },
      {
        name: 'Layer Feed Plus',
        category: 'layer',
        description: 'Complete nutrition for laying hens. Enriched with calcium for strong eggshells and omega-3 for healthier eggs.',
        nutrients: { protein: 18, fat: 4, fiber: 5, moisture: 12 },
        price: 22.99,
        stock: 200,
        image: 'https://images.unsplash.com/photo-1569397288884-4d43d6738fbd?w=600&q=80',
      },
      {
        name: 'Pig Grower Feed',
        category: 'pig',
        description: 'Balanced diet for growing pigs. Promotes healthy weight gain and optimal feed conversion ratio.',
        nutrients: { protein: 16, fat: 6, fiber: 5, moisture: 13 },
        price: 28.99,
        stock: 80,
        image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&q=80',
      },
      {
        name: 'Cattle Finisher',
        category: 'cattle',
        description: 'High-energy feed for finishing cattle. Designed for maximum weight gain in the final feeding period.',
        nutrients: { protein: 14, fat: 4, fiber: 8, moisture: 12 },
        price: 19.99,
        stock: 300,
        image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&q=80',
      },
      {
        name: 'Fish Feed Pellets',
        category: 'fish',
        description: 'Floating pellets for various fish species. High digestibility and water stability.',
        nutrients: { protein: 35, fat: 8, fiber: 3, moisture: 10 },
        price: 35.99,
        stock: 120,
        image: 'https://images.unsplash.com/photo-1534043464124-3886f33848d6?w=600&q=80',
      },
      {
        name: 'Organic Layer Feed',
        category: 'layer',
        description: '100% organic feed for laying hens. Non-GMO ingredients with no artificial additives.',
        nutrients: { protein: 17, fat: 4, fiber: 6, moisture: 12 },
        price: 32.99,
        stock: 50,
        image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5bbed7?w=600&q=80',
      },
    ];

    await Product.insertMany(products);
    console.log('Created', products.length, 'products');

    // Create default content
    const contents = [
      {
        key: 'about',
        title: 'About Us',
        value: '<p>For over 20 years, AgroFeed has been the trusted partner for farmers nationwide. Our commitment to quality and innovation has made us a leading name in animal feed distribution.</p><p>We understand that healthy livestock is the foundation of a successful farm. That\'s why we source only the finest ingredients and employ rigorous quality control measures to ensure every bag of feed meets our high standards.</p><p>Our team of nutritionists and agricultural experts work tirelessly to develop feed formulas that maximize growth, improve health, and increase productivity for all types of livestock.</p>',
      },
      {
        key: 'privacy',
        title: 'Privacy Policy',
        value: '<h3>1. Information We Collect</h3><p>We collect information you provide directly to us, including your name, email address, phone number, and shipping address when you create an account or place an order.</p><h3>2. How We Use Your Information</h3><p>We use the information we collect to process your orders, communicate with you, improve our services, and send you marketing communications (with your consent).</p><h3>3. Data Security</h3><p>We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or disclosure.</p>',
      },
      {
        key: 'terms',
        title: 'Terms & Conditions',
        value: '<h3>1. Acceptance of Terms</h3><p>By accessing and using AgroFeed\'s website and services, you accept and agree to be bound by these Terms and Conditions.</p><h3>2. Use of Services</h3><p>You agree to use our services only for lawful purposes and in accordance with these terms.</p><h3>3. Orders and Payment</h3><p>All orders are subject to acceptance and availability. Payment must be made at the time of order placement.</p>',
      },
      {
        key: 'footer',
        title: 'Footer Content',
        value: '<p>AgroFeed - Your trusted partner in animal nutrition. Quality feed for healthier livestock.</p>',
      },
      {
        key: 'contact',
        title: 'Contact Information',
        value: '<p>Email: info@agrofeed.com<br>Phone: +1 (555) 123-4567<br>Address: 123 Farm Road, Agricultural District</p>',
      },
    ];

    await Content.insertMany(contents);
    console.log('Created', contents.length, 'content entries');

    console.log('\n✅ Seed completed successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@agrofeed.com / admin123');
    console.log('Customer: customer@example.com / customer123');

  } catch (error) {
    console.error('Seed failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed();
