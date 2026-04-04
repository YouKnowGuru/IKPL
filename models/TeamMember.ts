import mongoose from 'mongoose';

export interface ITeamMember extends mongoose.Document {
  name: string;
  photo: string;
  title: string;
  description: string;
  order: number;
}

const TeamMemberSchema = new mongoose.Schema<ITeamMember>(
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
      required: [true, 'Please provide a title'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.models?.TeamMember || mongoose.model<ITeamMember>('TeamMember', TeamMemberSchema);
