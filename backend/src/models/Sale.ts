import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  productCategory: string;
  basePrice: number;
  qty: number;
  selectedVariants: {
    variantId: mongoose.Types.ObjectId | string;
    name: string;
    extraPrice: number;
  }[];
  note?: string;
}

export interface ISale extends Document {
  orderNumber: string;
  customerName?: string;
  orderType: 'DINE_IN' | 'TAKE_AWAY';
  items: ICartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment: {
    method: 'CASH' | 'QRIS' | 'TRANSFER';
    paidAmount: number;
    change: number;
  };
  status: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED';
  date: Date; // Corresponds to frontend date string
  createdAt: Date;
  updatedAt: Date;
}

const SelectedVariantSchema = new Schema(
  {
    variantId: { type: Schema.Types.Mixed },
    name: { type: String, required: true },
    extraPrice: { type: Number, default: 0 },
  },
  { _id: false }
);

const CartItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    productCategory: { type: String },
    basePrice: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
    selectedVariants: { type: [SelectedVariantSchema], default: [] },
    note: { type: String },
  },
  { _id: false }
);

const SaleSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customerName: { type: String },
    orderType: { type: String, enum: ['DINE_IN', 'TAKE_AWAY'], required: true },
    items: { type: [CartItemSchema], required: true },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    payment: {
      method: { type: String, enum: ['CASH', 'QRIS', 'TRANSFER'], required: true },
      paidAmount: { type: Number, required: true },
      change: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ['PENDING', 'PREPARING', 'READY', 'COMPLETED'],
      default: 'PENDING',
    },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<ISale>('Sale', SaleSchema);
