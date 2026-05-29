import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fetch native API to avoid axios dependency requirement just for script
const API_URL = 'http://localhost:3000/api';

const log = (msg: string) => console.log(`[Integration Test] ${msg}`);
const logSuccess = (msg: string) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`);
const logError = (msg: string) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`);

let authToken = '';

async function request(endpoint: string, method: string = 'GET', body?: any) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`API Error [${method} ${endpoint}]: ${response.status} - ${JSON.stringify(data)}`);
  }

  return data;
}

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), 'backend', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pos_kopi';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_please_change_in_production';

// ...
async function runTests() {
  log('Mulai Pengujian Integrasi Modul Aplikasi POS Kedai Kopi');
  try {
    // Connect to DB to inject user
    await mongoose.connect(MONGODB_URI);
    
    // 1. Modul Autentikasi
    log('--- 1. Modul Auth ---');
    const testEmail = `test${Date.now()}@test.com`;
    const testPassword = 'password123';
    
    log(`Register akun baru via DB: ${testEmail}`);
    
    const db = mongoose.connection.db;
    if (!db) throw new Error("DB connection failed");
    
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(testPassword, salt);
    
    await db.collection('users').insertOne({
      name: 'Test Owner',
      email: testEmail,
      passwordHash: passwordHash,
      role: 'OWNER',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    logSuccess('Registrasi (DB inject) berhasil');

    // Login
    log(`Login akun: ${testEmail}`);
    const loginRes = await request('/auth/login', 'POST', {
      email: testEmail,
      password: testPassword
    });
    authToken = loginRes.token;
    logSuccess(`Login berhasil, Token diperoleh`);

    // Me
    const meRes = await request('/auth/me', 'GET');
    if (meRes.user.email !== testEmail) throw new Error('Data profil tidak sesuai');
    logSuccess('Akses profil (/auth/me) berhasil');

    // 2. Modul Product
    log('\n--- 2. Modul Product ---');
    const productRes = await request('/products', 'POST', {
      name: 'Kopi Susu Test',
      category: 'ESPRESSO',
      basePrice: 15000,
      image: '',
      description: 'Test product',
      stock: 100,
      isActive: true,
      variants: []
    });
    const productId = productRes._id;
    logSuccess(`Produk berhasil dibuat (ID: ${productId}, Stock: 100)`);

    // 3. Modul Sale (Pesanan)
    log('\n--- 3. Modul Sale & Pesanan ---');
    const saleData = {
      customerName: 'Bapak Test',
      orderType: 'DINE_IN',
      items: [
        {
          product: {
            id: productId,
            name: 'Kopi Susu Test',
            category: 'ESPRESSO',
            basePrice: 15000,
            variants: []
          },
          qty: 2,
          selectedVariantIds: [],
          note: 'Kurang manis'
        }
      ],
      subtotal: 30000,
      discount: 0,
      tax: 0,
      total: 30000,
      paymentMethod: 'CASH',
      paidAmount: 50000
    };
    
    // Buat pesanan baru
    const createSaleRes = await request('/sales', 'POST', saleData);
    const saleId = createSaleRes._id;
    if (createSaleRes.status !== 'PENDING') throw new Error(`Status tidak PENDING, melainkan: ${createSaleRes.status}`);
    logSuccess(`Pesanan berhasil dibuat (ID: ${saleId}, Status: PENDING)`);

    // Barista Flow
    const prepSaleRes = await request(`/sales/${saleId}/status`, 'PUT', { status: 'PREPARING' });
    if (prepSaleRes.status !== 'PREPARING') throw new Error('Gagal update PREPARING');
    logSuccess('Barista update status ke PREPARING berhasil');

    const readySaleRes = await request(`/sales/${saleId}/status`, 'PUT', { status: 'READY' });
    if (readySaleRes.status !== 'READY') throw new Error('Gagal update READY');
    logSuccess('Barista update status ke READY berhasil');

    const compSaleRes = await request(`/sales/${saleId}/status`, 'PUT', { status: 'COMPLETED' });
    if (compSaleRes.status !== 'COMPLETED') throw new Error('Gagal update COMPLETED');
    logSuccess('Kasir menyelesaikan pesanan (COMPLETED) berhasil');

    // Cek Pengurangan Stok Produk
    const productsList = await request('/products', 'GET');
    const updatedProduct = productsList.find((p: any) => p.id === productId);
    if (!updatedProduct) throw new Error('Produk hilang');
    if (updatedProduct.stock !== 98) throw new Error(`Stok produk tidak sesuai (Expected 98, Got ${updatedProduct.stock})`);
    logSuccess('Validasi stok otomatis berkurang (-2 qty) berhasil!');

    // 4. Modul Settings
    log('\n--- 4. Modul Settings ---');
    const settingsRes = await request('/settings', 'GET');
    logSuccess(`Ambil pengaturan berhasil (Nama Toko: ${settingsRes.shopName || 'N/A'})`);

    // 5. Modul Financial (Laporan)
    log('\n--- 5. Modul Laporan Keuangan ---');
    const salesList = await request('/sales', 'GET');
    const saleFound = salesList.find((s: any) => s.id === saleId);
    if (!saleFound) throw new Error('Pesanan tidak ditemukan di daftar laporan');
    logSuccess('Data pesanan berhasil terindeks di Laporan Penjualan');

    log('\n\x1b[32m===========================================\x1b[0m');
    log('\x1b[32mSEMUA MODUL BERHASIL LULUS UJI INTEGRASI!\x1b[0m');
    log('\x1b[32m===========================================\x1b[0m\n');
    
  } catch (error: any) {
    logError(error.message);
    process.exit(1);
  }
}

runTests();
