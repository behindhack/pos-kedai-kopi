import mongoose, { Schema, Document } from 'mongoose';

export interface IRawMaterial extends Document {
  name: string;
  stock: number;
  unit: string;
  minStock: number;
  lastRestock: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RawMaterialSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    unit: { type: String, required: true },
    minStock: { type: Number, required: true, default: 0 },
    lastRestock: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IRawMaterial>('RawMaterial', RawMaterialSchema);
