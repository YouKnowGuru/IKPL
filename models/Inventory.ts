import mongoose from 'mongoose';

export interface IInventory extends mongoose.Document {
  productId: mongoose.Types.ObjectId;
  locationId: mongoose.Types.ObjectId;
  stock: number;
}

const InventorySchema = new mongoose.Schema<IInventory>(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: [true, 'Location is required'],
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
  },
  { timestamps: true }
);

// Prevent duplicate entries - same product, same store
InventorySchema.index({ productId: 1, locationId: 1 }, { unique: true });

export default mongoose.models?.Inventory ||
  mongoose.model<IInventory>('Inventory', InventorySchema);
