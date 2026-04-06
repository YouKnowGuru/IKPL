import mongoose from 'mongoose';

export interface IProduct extends mongoose.Document {
  name: string;
  categoryId: mongoose.Types.ObjectId;
  description: string;
  nutrients: {
    protein: string;
    fat: string;
    fiber: string;
    moisture: string;
    others?: string;
  };
  price?: number | null;
  images: string[];
  unit: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new mongoose.Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
      maxlength: [100, 'Product name cannot be more than 100 characters'],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please provide a category'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    nutrients: {
      protein: { type: String, default: '0' },
      fat:     { type: String, default: '0' },
      fiber:   { type: String, default: '0' },
      moisture:{ type: String, default: '0' },
      others:  { type: String, default: '' },
    },
    price: {
      type: Number,
      default: null,
      min: [0, 'Price cannot be negative'],
    },
    images: {
      type: [String],
      default: [],
    },
    unit: {
      type: String,
      default: 'bags',
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', description: 'text' });

export default mongoose.models?.Product ||
  mongoose.model<IProduct>('Product', ProductSchema);
