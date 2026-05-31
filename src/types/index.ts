// src/types/index.ts
export type UserRole = 'OWNER' | 'CASHIER' | 'BARISTA';
export type OrderType = 'DINE_IN' | 'TAKE_AWAY';

export interface ProductVariant {
  id: string;
  name: string;
  extraPrice: number;
}

export interface RecipeItem {
  materialId: string;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  category: 'ESPRESSO' | 'MANUAL_BREW' | 'NON_COFFEE' | 'FOOD';
  basePrice: number;
  image?: string;
  variants?: ProductVariant[];
  recipe?: RecipeItem[];
  stock?: number;
  isActive: boolean;
}

export interface CartItem {
  product: Product;
  qty: number;
  selectedVariantIds: string[];
  note?: string;
}

export type PaymentMethod = 'CASH' | 'QRIS' | 'TRANSFER';

export interface Payment {
  method: PaymentMethod;
  paidAmount: number;
  change: number;
}

export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED';

export interface Sale {
  id: string;
  orderNumber?: string;
  date: string;
  customerName?: string;
  cashierName?: string;
  orderType: OrderType;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment: Payment;
  status?: OrderStatus;
}

export interface ShopSettings {
  shopName: string;
  shopLogo: string; // base64 or image url
  address?: string;
  phone?: string;
  taxPercent?: number;
  defaultDiscount?: number;
  printSettings: {
    showLogo: boolean;
    showAddress: boolean;
    paperWidth: number; // in mm, default 80
  };
}

// Raw Material Types
export type RawMaterialCategory = 'COFFEE_BEAN' | 'INGREDIENT' | 'PACKAGING' | 'OTHER';

export interface RawMaterial {
  id: string;
  name: string;
  category: RawMaterialCategory;
  unit: string;
  quantity: number;
  minQuantity: number;
  costPerUnit: number;
  supplier?: string;
  totalCost: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Financial Report Types
export interface FinancialReport {
  id: string;
  startDate: string;
  endDate: string;
  
  // Revenue
  grossRevenue: number;
  discounts: number;
  taxes: number;
  netRevenue: number;
  
  // COGS
  openingStock: number;
  purchases: number;
  closingStock: number;
  cogs: number;
  
  // Operating Expenses
  utilities: number;
  rent: number;
  payroll: number;
  otherExpenses: number;
  totalOperatingExpenses: number;
  
  // Profit/Loss
  grossProfit: number;
  operatingProfit: number;
  netProfit: number;
}

export interface ProfitLossCalculation {
  period: {
    startDate: string;
    endDate: string;
  };
  revenue: {
    netRevenue: number;
  };
  cogs: {
    openingStock: number;
    purchases: number;
    closingStock: number;
    total: number;
  };
  expenses: {
    utilities: number;
    rent: number;
    payroll: number;
    otherExpenses: number;
    total: number;
  };
  profit: {
    grossProfit: number;
    netProfit: number;
  };
  profitMargin: string | number;
}