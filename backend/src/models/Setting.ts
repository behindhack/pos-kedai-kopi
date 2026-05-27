import mongoose, { Schema, Document } from 'mongoose';

export interface ISetting extends Document {
  name: string;
  address: string;
  phone: string;
  receiptPrinterIp?: string;
  taxPercent: number;
  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema: Schema = new Schema(
  {
    name: { type: String, required: true, default: 'Kedai Kopi' },
    address: { type: String, required: true, default: 'Alamat Kedai Kopi' },
    phone: { type: String, required: true, default: '081234567890' },
    receiptPrinterIp: { type: String },
    taxPercent: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

// Mongoose doesn't easily restrict a collection to a single document,
// but we will handle logic in the controller to always update the first document found.
export default mongoose.model<ISetting>('Setting', SettingSchema);
