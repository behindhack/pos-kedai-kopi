import mongoose, { Schema, Document } from 'mongoose';

export interface IProductVariant {
  _id?: mongoose.Types.ObjectId;
  name: string;
  extraPrice: number;
}

export interface IProduct extends Document {
  name: string;
  category: 'ESPRESSO' | 'MANUAL_BREW' | 'NON_COFFEE' | 'FOOD';
  basePrice: number;
  variants: IProductVariant[];
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema: Schema = new Schema({
  name: { type: String, required: true },
  extraPrice: { type: Number, default: 0 },
});

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['ESPRESSO', 'MANUAL_BREW', 'NON_COFFEE', 'FOOD'],
      required: true,
    },
    basePrice: { type: Number, required: true, min: 0 },
    variants: { type: [ProductVariantSchema], default: [] },
    image: { type: String }, // Can be base64 string or URL
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>('Product', ProductSchema);
