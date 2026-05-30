import { defineStore } from 'pinia';
import { apiClient } from '../services/api';
import { Preferences } from '@capacitor/preferences';

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
    async loadFromStorage() {
      const { value: token } = await Preferences.get({ key: 'auth_token' });
      const { value: loginTime } = await Preferences.get({ key: 'login_timestamp' });
      
      // Check session expiry (24 hours)
      if (loginTime) {
        const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
        if (Date.now() - parseInt(loginTime, 10) > SESSION_DURATION) {
          await this.logout();
          return;
        }
      }

      if (token) {
        this.token = token;
        apiClient.setToken(token);
      }
      const { value: user } = await Preferences.get({ key: 'current_user' });
      if (user) {
        this.currentUser = JSON.parse(user);
      }
    },

    async register(email: string, password: string, name: string, role?: string) {
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
        const result = await apiClient.register(email, password, name, role);
        if (result.error) {
          this.error = result.error;
          throw new Error(result.error);
        }

        this.token = result.data?.token ?? null;
        this.currentUser = result.data?.user ?? null;

        if (this.token) {
          await Preferences.set({ key: 'auth_token', value: this.token });
          apiClient.setToken(this.token);
        }
        if (this.currentUser) {
          await Preferences.set({ key: 'current_user', value: JSON.stringify(this.currentUser) });
          await Preferences.set({ key: 'login_timestamp', value: Date.now().toString() });
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
          await Preferences.set({ key: 'auth_token', value: this.token });
          apiClient.setToken(this.token);
        }
        if (this.currentUser) {
          await Preferences.set({ key: 'current_user', value: JSON.stringify(this.currentUser) });
          await Preferences.set({ key: 'login_timestamp', value: Date.now().toString() });
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

    async forgotPassword(email: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const result = await apiClient.forgotPassword(email);
        if (result.error) {
          this.error = result.error;
          return { success: false, error: result.error };
        }
        return { success: true, message: result.data?.message, devToken: result.data?.devToken };
      } catch (error: any) {
        const errorMsg = error.message || 'Gagal mengirim permintaan reset password';
        this.error = errorMsg;
        return { success: false, error: errorMsg };
      } finally {
        this.isLoading = false;
      }
    },

    async resetPassword(token: string, newPassword: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const result = await apiClient.resetPassword(token, newPassword);
        if (result.error) {
          this.error = result.error;
          return { success: false, error: result.error };
        }
        return { success: true, message: result.data?.message };
      } catch (error: any) {
        const errorMsg = error.message || 'Gagal mereset password';
        this.error = errorMsg;
        return { success: false, error: errorMsg };
      } finally {
        this.isLoading = false;
      }
    },

    async logout() {
      this.currentUser = null;
      this.token = null;
      this.error = null;
      await Preferences.remove({ key: 'auth_token' });
      await Preferences.remove({ key: 'current_user' });
      await Preferences.remove({ key: 'login_timestamp' });
      apiClient.clearToken();
    },

    clearError() {
      this.error = null;
    },

    async setCurrentUser(user: User | null) {
      this.currentUser = user;
      if (user) {
        await Preferences.set({ key: 'current_user', value: JSON.stringify(user) });
      } else {
        await Preferences.remove({ key: 'current_user' });
      }
    },
  },
});