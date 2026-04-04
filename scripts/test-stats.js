const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const OrderSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  status: String,
  totalPrice: Number,
  paymentStatus: String,
  amountPaid: Number,
  locationId: mongoose.Schema.Types.ObjectId
}, { timestamps: true, strict: false });

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
    
    // 1. General Check
    const all = await Order.find({ status: { $ne: 'cancelled' } });
    console.log(`Total active orders: ${all.length}`);
    
    // 2. Credit Check
    const creditOrders = all.filter(o => o.paymentStatus === 'credit');
    console.log(`Credit orders found by find(): ${creditOrders.length}`);
    if (creditOrders.length > 0) {
        console.log('Example Credit Order:', {
            id: creditOrders[0]._id,
            total: creditOrders[0].totalPrice,
            paid: creditOrders[0].amountPaid,
            typeTotal: typeof creditOrders[0].totalPrice,
            typePaid: typeof creditOrders[0].amountPaid
        });
    }

    // 3. Run the EXACT aggregation for Credit
    const creditAgg = await Order.aggregate([
        { $match: { paymentStatus: 'credit', status: { $ne: 'cancelled' } } },
        { 
          $group: { 
            _id: null, 
            total: { 
              $sum: { 
                $subtract: [
                  { $ifNull: ['$totalPrice', 0] }, 
                  { $ifNull: ['$amountPaid', 0] }
                ] 
              } 
            } 
          } 
        },
    ]);
    console.log('Credit Aggregation Result:', JSON.stringify(creditAgg));

    // 4. Run the EXACT aggregation for Advance
    const advanceAgg = await Order.aggregate([
        { $match: { status: { $in: ['pending', 'confirmed', 'ready_for_pickup'] } } },
        { $group: { _id: null, total: { $sum: { $ifNull: ['$amountPaid', 0] } } } },
    ]);
    console.log('Advance Aggregation Result:', JSON.stringify(advanceAgg));

    // 5. Check if any order has amountPaid > 0
    const paidSomething = all.filter(o => o.amountPaid > 0);
    console.log(`Orders with amountPaid > 0: ${paidSomething.length}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
