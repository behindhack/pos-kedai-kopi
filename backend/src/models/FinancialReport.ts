import mongoose, { Schema, Document } from 'mongoose';

export interface IFinancialReport extends Document {
  startDate: Date;
  endDate: Date;
  grossRevenue: number;
  discounts: number;
  taxes: number;
  netRevenue: number;
  openingStock: number;
  purchases: number;
  closingStock: number;
  cogs: number;
  utilities: number;
  rent: number;
  payroll: number;
  otherExpenses: number;
  totalOperatingExpenses: number;
  grossProfit: number;
  operatingProfit: number;
  netProfit: number;
}

const FinancialReportSchema: Schema = new Schema(
  {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    grossRevenue: { type: Number, default: 0 },
    discounts: { type: Number, default: 0 },
    taxes: { type: Number, default: 0 },
    netRevenue: { type: Number, default: 0 },
    openingStock: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    closingStock: { type: Number, default: 0 },
    cogs: { type: Number, default: 0 },
    utilities: { type: Number, default: 0 },
    rent: { type: Number, default: 0 },
    payroll: { type: Number, default: 0 },
    otherExpenses: { type: Number, default: 0 },
    totalOperatingExpenses: { type: Number, default: 0 },
    grossProfit: { type: Number, default: 0 },
    operatingProfit: { type: Number, default: 0 },
    netProfit: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

export default mongoose.model<IFinancialReport>('FinancialReport', FinancialReportSchema);
