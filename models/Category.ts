import mongoose from 'mongoose';

export interface ICategory extends mongoose.Document {
  name: string;
  parentId?: mongoose.Types.ObjectId | null;
  slug: string;
}

const CategorySchema = new mongoose.Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models?.Category ||
  mongoose.model<ICategory>('Category', CategorySchema);
