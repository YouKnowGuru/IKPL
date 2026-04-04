import mongoose from 'mongoose';

export interface IPartner extends mongoose.Document {
  name: string;
  photo: string;
  title?: string;
  description?: string;
  order: number;
}

const PartnerSchema = new mongoose.Schema<IPartner>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    photo: {
      type: String,
      required: [true, 'Please provide a photo URL'],
    },
    title: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.models?.Partner || mongoose.model<IPartner>('Partner', PartnerSchema);
