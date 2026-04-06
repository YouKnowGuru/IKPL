import mongoose from 'mongoose';

export interface IOrder extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  items: {
    productId: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
  }[];
  locationId: mongoose.Types.ObjectId;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'ready_for_pickup' | 'completed' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid' | 'credit' | 'partial';
  amountPaid: number;
  paymentMethod?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new mongoose.Schema<IOrder>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1'],
        },
        price: {
          type: Number,
          min: [0, 'Price cannot be negative'],
          default: 0,
        },
      },
    ],
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: [true, 'Pickup location is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'ready_for_pickup', 'completed', 'cancelled'],
      default: 'pending',
    },
    totalPrice: {
      type: Number,
      min: [0, 'Total price cannot be negative'],
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'credit', 'partial'],
      default: 'unpaid',
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ locationId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });

const Order = (mongoose.models.Order as mongoose.Model<IOrder>) ?? mongoose.model<IOrder>('Order', OrderSchema);
export default Order;
