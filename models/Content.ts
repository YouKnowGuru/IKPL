import mongoose from 'mongoose';

export interface IContent extends mongoose.Document {
  key: 'privacy' | 'terms' | 'about' | 'footer' | 'contact' | 'hero';
  value: string;
  title: string;
}

const ContentSchema = new mongoose.Schema<IContent>(
  {
    key: {
      type: String,
      required: [true, 'Please provide a content key'],
      unique: true,
      enum: ['privacy', 'terms', 'about', 'footer', 'contact', 'hero'],
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
    },
    value: {
      type: String,
      required: [true, 'Please provide content value'],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models?.Content || mongoose.model<IContent>('Content', ContentSchema);
