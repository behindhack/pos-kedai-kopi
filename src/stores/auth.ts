import { defineStore } from 'pinia';
import { apiClient } from '../services/api';

import type { UserRole } from '../types';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentUser: null as User | null,
    token: null as string | null,
    isLoading: false,
    error: null as string | null,
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    isOwner: (state) => state.currentUser?.role === 'OWNER',
    isCashier: (state) => state.currentUser?.role === 'CASHIER',
    isBarista: (state) => state.currentUser?.role === 'BARISTA',
    userRole: (state) => state.currentUser?.role || null,
  },

  actions: {
    loadFromStorage() {
      const token = localStorage.getItem('auth_token');
      const loginTime = localStorage.getItem('login_timestamp');
      
      // Check session expiry (24 hours)
      if (loginTime) {
        const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
        if (Date.now() - parseInt(loginTime, 10) > SESSION_DURATION) {
          this.logout();
          return;
        }
      }

      if (token) {
        this.token = token;
        apiClient.setToken(token);
      }
      const user = localStorage.getItem('current_user');
      if (user) {
        this.currentUser = JSON.parse(user);
      }
    },

    async register(email: string, password: string, name: string) {
      this.isLoading = true;
      this.error = null;
      
      // Validate input
      if (!email || !password || !name) {
        this.error = 'Email, password, dan nama harus diisi';
        this.isLoading = false;
        return { success: false, error: this.error };
      }
      
      if (password.length < 6) {
        this.error = 'Password minimal 6 karakter';
        this.isLoading = false;
        return { success: false, error: this.error };
      }

      try {
        const result = await apiClient.register(email, password, name);
        if (result.error) {
          this.error = result.error;
          throw new Error(result.error);
        }

        this.token = result.data?.token ?? null;
        this.currentUser = result.data?.user ?? null;

        if (this.token) {
          localStorage.setItem('auth_token', this.token);
          apiClient.setToken(this.token);
        }
        if (this.currentUser) {
          localStorage.setItem('current_user', JSON.stringify(this.currentUser));
          localStorage.setItem('login_timestamp', Date.now().toString());
        }

        return { success: true };
      } catch (error: any) {
        const errorMsg = error.message || 'Registrasi gagal, silakan coba lagi';
        this.error = errorMsg;
        return { success: false, error: errorMsg };
      } finally {
        this.isLoading = false;
      }
    },

    async login(email: string, password: string) {
      this.isLoading = true;
      this.error = null;
      
      // Validate input
      if (!email || !password) {
        this.error = 'Email dan password harus diisi';
        this.isLoading = false;
        return { success: false, error: this.error };
      }

      try {
        const result = await apiClient.login(email, password);
        if (result.error) {
          this.error = result.error;
          throw new Error(result.error);
        }

        this.token = result.data?.token ?? null;
        this.currentUser = result.data?.user ?? null;

        if (this.token) {
          localStorage.setItem('auth_token', this.token);
          apiClient.setToken(this.token);
        }
        if (this.currentUser) {
          localStorage.setItem('current_user', JSON.stringify(this.currentUser));
          localStorage.setItem('login_timestamp', Date.now().toString());
        }

        return { success: true };
      } catch (error: any) {
        const errorMsg = error.message || 'Login gagal, silakan coba lagi';
        this.error = errorMsg;
        return { success: false, error: errorMsg };
      } finally {
        this.isLoading = false;
      }
    },

    logout() {
      this.currentUser = null;
      this.token = null;
      this.error = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('current_user');
      localStorage.removeItem('login_timestamp');
      apiClient.clearToken();
    },

    clearError() {
      this.error = null;
    },

    setCurrentUser(user: User | null) {
      this.currentUser = user;
      if (user) {
        localStorage.setItem('current_user', JSON.stringify(user));
      }
    },
  },
});