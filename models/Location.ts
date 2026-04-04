import mongoose from 'mongoose';

export interface ILocation extends mongoose.Document {
  name: string;
  district: string;
  address: string;
  contact?: string;
  adminId?: mongoose.Types.ObjectId | null;
  isActive: boolean;
}

const LocationSchema = new mongoose.Schema<ILocation>(
  {
    name: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    contact: {
      type: String,
      default: '',
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

LocationSchema.index({ district: 1 });

export default mongoose.models?.Location ||
  mongoose.model<ILocation>('Location', LocationSchema);
