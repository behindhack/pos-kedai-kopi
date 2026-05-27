// src/services/api.ts
import axios from 'axios';
import type { UserRole, Product, Sale, ShopSettings, RawMaterial } from '../types';

// Konfigurasi baseURL Axios (sesuaikan dengan URL backend Anda)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios Interceptor untuk otomatis menyematkan token JWT ke setiap request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
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
  (error) => {
    if (error.response && error.response.status === 401) {
      // Jika token invalid/expired, paksa logout
      localStorage.removeItem('auth_token');
      localStorage.removeItem('current_user');
      localStorage.removeItem('login_timestamp');
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
  
  setToken(token: string) {
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    localStorage.removeItem('auth_token');
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  async login(email: string, password: string) {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      this.setToken(response.data.token);
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

  async getCurrentUser() {
    try {
      const token = this.getToken();
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
    try {
      const response = await axiosInstance.post('/sales', data);
      return { data: { sale: response.data, change: response.data.payment.change }, error: null };
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

  // ==========================================
  // RAW MATERIAL EXTENDED (MOCK)
  // ==========================================

  async getLowStockMaterials(storeId?: string) {
    return { data: [] as any[], error: null };
  }

  async getTotalRawMaterialCost(storeId?: string) {
    return { data: { totalCost: 0, materialCount: 0, materials: [] } as any, error: null };
  }

  async updateRawMaterialStock(id: string, quantity: number) {
    return { data: null as any, error: 'Not implemented' };
  }
}

export const apiClient = new APIClient();
export default apiClient;
