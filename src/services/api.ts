// src/services/api.ts
import axios from 'axios';
import { Preferences } from '@capacitor/preferences';
import type { UserRole, Product, Sale, ShopSettings, RawMaterial } from '../types';

// Konfigurasi baseURL Axios (sesuaikan dengan URL backend Anda)
const API_URL = import.meta.env.VITE_API_URL || '/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios Interceptor untuk otomatis menyematkan token JWT ke setiap request
axiosInstance.interceptors.request.use(async (config) => {
  const { value: token } = await Preferences.get({ key: 'auth_token' });
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Axios Interceptor untuk handle error (khususnya 401 Unauthorized)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Jika token invalid/expired, paksa logout
      await Preferences.remove({ key: 'auth_token' });
      await Preferences.remove({ key: 'current_user' });
      await Preferences.remove({ key: 'login_timestamp' });
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Helper for error handling
const handleApiError = (error: any) => {
  console.error('API Error:', error);
  const message = error.response?.data?.error || error.message || 'Terjadi kesalahan pada server';
  return { data: null, error: message };
};

class APIClient {
  
  // ==========================================
  // AUTHENTICATION
  // ==========================================
  
  async setToken(token: string) {
    await Preferences.set({ key: 'auth_token', value: token });
  }

  async clearToken() {
    await Preferences.remove({ key: 'auth_token' });
  }

  async getToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: 'auth_token' });
    return value;
  }
  
  async checkSetupStatus() {
    try {
      const response = await axiosInstance.get('/auth/setup-status');
      return { data: response.data, error: null };
    } catch (error) {
      return handleApiError(error);
    }
  }

  async login(email: string, password: string) {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      await this.setToken(response.data.token);
      return { data: response.data, error: null };
    } catch (error) {
      return handleApiError(error);
    }
  }

  async register(email: string, password: string, name: string, role?: string) {
    try {
      const response = await axiosInstance.post('/auth/register', { email, password, name, role });
      return { data: response.data, error: null };
    } catch (error) {
      return handleApiError(error);
    }
  }

  async forgotPassword(email: string) {
    try {
      const response = await axiosInstance.post('/auth/forgot-password', { email });
      return { data: response.data, error: null };
    } catch (error) {
      return handleApiError(error);
    }
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const response = await axiosInstance.post('/auth/reset-password', { token, newPassword });
      return { data: response.data, error: null };
    } catch (error) {
      return handleApiError(error);
    }
  }

  async getCurrentUser() {
    try {
      const token = await this.getToken();
      if (!token) return { data: null, error: 'Tidak ada sesi login' };
      
      const response = await axiosInstance.get('/auth/me');
      return { data: response.data, error: null };
    } catch (error) {
      return handleApiError(error);
    }
  }

  // ==========================================
  // PRODUCTS
  // ==========================================

  async getProducts(category?: string) {
    try {
      const response = await axiosInstance.get('/products');
      let products: Product[] = response.data;
      if (category && category !== 'ALL') {
        products = products.filter((p: Product) => p.category === category);
      }
      return { data: { products }, error: null };
    } catch (error) {
      return handleApiError(error);
    }
  }

  async createProduct(data: Partial<Product>) {
    try {
      const response = await axiosInstance.post('/products', data);
      return { data: { product: response.data }, error: null };
    } catch (error) {
      return handleApiError(error);
    }
  }

  async updateProduct(id: string, data: Partial<Product>) {
    try {
      const response = await axiosInstance.put(`/products/${id}`, data);
      return { data: { product: response.data }, error: null };
    } catch (error) {
      return handleApiError(error);
    }
  }

  async deleteProduct(id: string) {
    try {
      await axiosInstance.delete(`/products/${id}`);
      return { data: { success: true }, error: null };
    } catch (error) {
      return handleApiError(error);
    }
  }

  // ==========================================
  // SALES / ORDERS
  // ==========================================

  async createSale(data: any) {
    console.log('--- CREATE SALE API V2 CALLED ---');
    try {
      const response = await axiosInstance.post('/sales', data);
      return { data: { sale: response.data }, error: null };
    } catch (error) {
      return handleApiError(error);
    }
  }

  async getSalesReport(startDate?: string, endDate?: string) {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await axiosInstance.get(`/sales?${params.toString()}`);
      return { data: { sales: response.data }, error: null };
    } catch (error) {
      return handleApiError(error);
    }
  }

  async getSaleById(id: string) {
    try {
      const response = await axiosInstance.get(`/sales/${id}`);
      return { data: { sale: response.data }, error: null };
    } catch (error) {
      return handleApiError(error);
    }
  }
  
  async updateSaleStatus(id: string, status: string) {
    try {
      const response = await axiosInstance.put(`/sales/${id}/status`, { status });
      return { data: { sale: response.data }, error: null };
    } catch (error) {
      return handleApiError(error);
    }
  }

  async paySale(id: string, paymentMethod: string, paidAmount: number) {
    try {
      const response = await axiosInstance.put(`/sales/${id}/pay`, { paymentMethod, paidAmount });
      return { data: { sale: response.data }, error: null };
    } catch (error) {
      return handleApiError(error);
    }
  }

  // ==========================================
  // INVENTORY (RAW MATERIALS)
  // ==========================================

  async getRawMaterials(storeId?: string) {
    try {
      const response = await axiosInstance.get('/inventory');
      return { data: response.data, error: null };
    } catch (error) {
      // Fallback for missing backend endpoint
      console.warn('Inventory endpoint may not exist on backend yet.');
      return { data: [], error: null };
    }
  }

  async createRawMaterial(data: any) {
    try {
      const response = await axiosInstance.post('/inventory', data);
      return { data: response.data, error: null };
    } catch (error) {
      return handleApiError(error);
    }
  }

  async updateRawMaterial(id: string, data: any) {
    try {
      const response = await axiosInstance.put(`/inventory/${id}`, data);
      return { data: response.data, error: null };
    } catch (error) {
      return handleApiError(error);
    }
  }

  async deleteRawMaterial(id: string) {
    try {
      await axiosInstance.delete(`/inventory/${id}`);
      return { data: { success: true }, error: null };
    } catch (error) {
      return handleApiError(error);
    }
  }

  async updateRawMaterialStock(id: string, quantity: number) {
    try {
      const response = await axiosInstance.put(`/inventory/${id}`, { quantity });
      return { data: response.data, error: null };
    } catch (error) {
      return handleApiError(error);
    }
  }

  async getLowStockMaterials(storeId?: string) {
    try {
      const response = await axiosInstance.get('/inventory');
      const materials = response.data || [];
      // Filter materials where quantity <= minQuantity
      const lowStock = materials.filter((m: any) => m.quantity <= m.minQuantity);
      return { data: lowStock, error: null };
    } catch (error) {
      return { data: [], error: null };
    }
  }

  async getTotalRawMaterialCost(storeId?: string) {
    try {
      const response = await axiosInstance.get('/inventory');
      const materials = response.data || [];
      const totalCost = materials.reduce((sum: number, m: any) => sum + (m.totalCost || 0), 0);
      const materialCount = materials.length;
      return { 
        data: { 
          totalCost, 
          materialCount, 
          materials 
        }, 
        error: null 
      };
    } catch (error) {
      return { 
        data: { 
          totalCost: 0, 
          materialCount: 0, 
          materials: [] 
        }, 
        error: null 
      };
    }
  }

  // ==========================================
  // SETTINGS
  // ==========================================

  async getSettings() {
    try {
      const response = await axiosInstance.get('/settings');
      return { data: response.data, error: null };
    } catch (error) {
      // Return defaults if backend fails
      return {
        data: {
          shopName: 'Kedai Kopi',
          address: '',
          phone: '',
          taxPercent: 0,
        },
        error: null
      };
    }
  }

  async updateSettings(data: any) {
    try {
      const response = await axiosInstance.put('/settings', data);
      return { data: response.data, error: null };
    } catch (error) {
      return handleApiError(error);
    }
  }
  
  // ==========================================
  // USERS (MOCK UNTIL BACKEND IMPLEMENTED)
  // ==========================================
  
  async getAllUsers() {
    try {
      const response = await axiosInstance.get('/users');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return [];
    }
  }

  generateUserId() {
    return `user-${Date.now()}`;
  }

  async createUser(data: any) {
    try {
      const response = await axiosInstance.post('/users', data);
      return { data: response.data, error: null };
    } catch (error) {
      return handleApiError(error);
    }
  }

  async updateUser(userId: string, data: any) {
    try {
      const response = await axiosInstance.put(`/users/${userId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }

  async deleteUser(userId: string) {
    try {
      await axiosInstance.delete(`/users/${userId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete user:', error);
      return false;
    }
  }

  // ==========================================
  // FINANCIAL REPORTS
  // ==========================================

  async getFinancialReports(storeId?: string, startDate?: string, endDate?: string) {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await axiosInstance.get(`/financial-reports?${params.toString()}`);
      return { data: response.data, error: null };
    } catch (error) {
      return handleApiError(error);
    }
  }

  async getLatestFinancialMetrics(storeId?: string) {
    try {
      const response = await axiosInstance.get('/financial-reports/metrics');
      return { data: response.data, error: null };
    } catch (error) {
      return handleApiError(error);
    }
  }

  async calculateProfitLoss(data: any) {
    try {
      const response = await axiosInstance.post('/financial-reports/calculate', data);
      return { data: response.data, error: null };
    } catch (error) {
      return handleApiError(error);
    }
  }

  async createFinancialReport(data: any) {
    try {
      const response = await axiosInstance.post('/financial-reports', data);
      return { data: response.data, error: null };
    } catch (error) {
      return handleApiError(error);
    }
  }

  async updateFinancialReport(id: string, data: any) {
    try {
      const response = await axiosInstance.put(`/financial-reports/${id}`, data);
      return { data: response.data, error: null };
    } catch (error) {
      return handleApiError(error);
    }
  }

  async deleteFinancialReport(id: string) {
    try {
      const response = await axiosInstance.delete(`/financial-reports/${id}`);
      return { data: response.data, error: null };
    } catch (error) {
      return handleApiError(error);
    }
  }
}

export const apiClient = new APIClient();
export default apiClient;
