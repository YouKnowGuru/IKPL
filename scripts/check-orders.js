const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const OrderSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  status: String,
  totalPrice: Number,
  paymentStatus: String,
  amountPaid: Number
}, { timestamps: true });

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
    
    const count = await Order.countDocuments();
    console.log(`Total Orders: ${count}`);
    
    const sample = await Order.find().limit(10);
    console.log('Sample Orders (Minimal Fields):');
    sample.forEach(o => {
      console.log(`ID: ${o._id}, Status: ${o.status}, PaymentStatus: ${o.paymentStatus}, Total: ${o.totalPrice}, Paid: ${o.amountPaid}`);
    });
    
    const creditOrders = await Order.find({ paymentStatus: 'credit' });
    console.log(`Credit Orders Count: ${creditOrders.length}`);
    
    const advanceOrders = await Order.find({ status: { $in: ['pending', 'confirmed', 'ready_for_pickup'] }, amountPaid: { $gt: 0 } });
    console.log(`Advance Orders Count: ${advanceOrders.length}`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
