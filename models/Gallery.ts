import mongoose from 'mongoose';

export interface IGallery extends mongoose.Document {
  imageUrl: string;
  caption?: string;
  category: 'Logistics' | 'Farming' | 'Events' | 'General';
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const GallerySchema = new mongoose.Schema<IGallery>(
  {
    imageUrl: {
      type: String,
      required: [true, 'Please provide an image URL'],
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [100, 'Caption cannot be more than 100 characters'],
    },
    category: {
      type: String,
      enum: ['Logistics', 'Farming', 'Events', 'General'],
      default: 'General',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models?.Gallery || mongoose.model<IGallery>('Gallery', GallerySchema);
