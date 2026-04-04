import mongoose from 'mongoose';

export interface IBlog extends mongoose.Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  author: mongoose.Schema.Types.ObjectId;
  category: 'Company News' | 'Expert Advice' | 'Farming Tips' | 'Other';
  published: boolean;
  readingTime: number;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new mongoose.Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a blog title'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Please provide a blog slug'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Please provide blog content'],
    },
    excerpt: {
      type: String,
      required: [true, 'Please provide a brief excerpt'],
      maxlength: [200, 'Excerpt cannot be more than 200 characters'],
    },
    coverImage: {
      type: String,
      default: '/images/placeholder-blog.jpg',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: ['Company News', 'Expert Advice', 'Farming Tips', 'Other'],
      default: 'Other',
    },
    published: {
      type: Boolean,
      default: false,
    },
    readingTime: {
      type: Number,
      default: 5,
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

// Indexing for search performance
BlogSchema.index({ title: 'text', content: 'text', excerpt: 'text' });

export default mongoose.models?.Blog || mongoose.model<IBlog>('Blog', BlogSchema);
