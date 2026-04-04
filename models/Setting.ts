import mongoose from 'mongoose';

export interface ISetting extends mongoose.Document {
  siteName: string;
  logo: string;
  copyright: string;
  contactInfo: {
    address: string;
    phone: string;
    email: string;
    workingHours?: string;
  };
  socialLinks: {
    facebook: string;
    instagram: string;
    whatsapp: string;
  };
  theme: 'light' | 'dark';
}

const SettingSchema = new mongoose.Schema<ISetting>(
  {
    siteName: { type: String, default: 'IKPL Feed Distribution' },
    logo: { type: String, default: '' },
    copyright: { type: String, default: '© 2026 IKPL Group. All rights reserved.' },
    contactInfo: {
      address: { type: String, default: '' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      workingHours: { type: String, default: 'Mon – Fri: 8AM – 6PM, Saturday: 9AM – 4PM' },
    },
    socialLinks: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      whatsapp: { type: String, default: '' },
    },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
  },
  { timestamps: true }
);

export default mongoose.models?.Setting ||
  mongoose.model<ISetting>('Setting', SettingSchema);
