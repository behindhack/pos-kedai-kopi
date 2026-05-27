// src/utils/validators.ts
import type { Product, CartItem } from '../types';

export interface ValidationError {
  field: string;
  message: string;
}

export const validateEmail = (email: string): ValidationError[] => {
  const errors: ValidationError[] = [];
  if (!email) {
    errors.push({ field: 'email', message: 'Email wajib diisi' });
  } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    errors.push({ field: 'email', message: 'Format email tidak valid' });
  }
  return errors;
};

export const validatePassword = (password: string): ValidationError[] => {
  const errors: ValidationError[] = [];
  if (!password) {
    errors.push({ field: 'password', message: 'Password wajib diisi' });
  } else if (password.length < 6) {
    errors.push({ field: 'password', message: 'Password minimal 6 karakter' });
  }
  return errors;
};

export const validateProductForm = (product: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!product.name?.trim()) {
    errors.push({ field: 'name', message: 'Nama produk wajib diisi' });
  } else if (product.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Nama produk minimal 2 karakter' });
  }

  if (!product.category) {
    errors.push({ field: 'category', message: 'Kategori wajib dipilih' });
  }

  if (!product.basePrice && product.basePrice !== 0) {
    errors.push({ field: 'basePrice', message: 'Harga dasar wajib diisi' });
  } else if (product.basePrice < 0) {
    errors.push({ field: 'basePrice', message: 'Harga tidak boleh negatif' });
  }

  if (product.stock < 0) {
    errors.push({ field: 'stock', message: 'Stok tidak boleh negatif' });
  }

  return errors;
};

export const validateCartNotEmpty = (cart: CartItem[]): ValidationError[] => {
  if (!cart || cart.length === 0) {
    return [{ field: 'cart', message: 'Keranjang belanja kosong' }];
  }
  return [];
};

export const validatePayment = (
  total: number,
  paidAmount: number,
  method: string
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!method) {
    errors.push({ field: 'paymentMethod', message: 'Metode pembayaran wajib dipilih' });
  }

  if (method === 'CASH') {
    if (!paidAmount || paidAmount <= 0) {
      errors.push({ field: 'paidAmount', message: 'Jumlah bayar wajib diisi dan harus lebih dari 0' });
    } else if (paidAmount < total) {
      errors.push({ field: 'paidAmount', message: 'Jumlah bayar kurang dari total belanja' });
    }
  }

  return errors;
};
