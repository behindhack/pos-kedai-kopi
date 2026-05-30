import { defineStore } from 'pinia';
import type { ShopSettings } from '../types';

import { apiClient } from '../services/api';

export const useShopStore = defineStore('shop', {
  state: () => ({
    settings: {
      shopName: 'Kedai Kopi POS',
      shopLogo: '☕',
      address: '',
      phone: '',
      printSettings: {
        showLogo: true,
        showAddress: true,
        paperWidth: 80,
      },
    } as ShopSettings,
    isLoading: false,
    error: null as string | null,
  }),

  actions: {
    async loadFromStorage() {
      this.isLoading = true;
      try {
        const response = await apiClient.getSettings();
        if (response.data && !response.error) {
          // Merge backend settings with defaults
          this.settings = { ...this.settings, ...response.data };
        }
      } catch (e) {
        console.error('Failed to load shop settings:', e);
      } finally {
        this.isLoading = false;
      }
    },

    async saveToStorage() {
      this.isLoading = true;
      this.error = null;
      try {
        const res = await apiClient.updateSettings(this.settings);
        if (res.error) {
          this.error = res.error;
        }
      } catch (e: any) {
        this.error = e.message || 'Gagal menyimpan pengaturan';
        console.error('Failed to save shop settings:', e);
      } finally {
        this.isLoading = false;
      }
    },

    async updateSettings(newSettings: Partial<ShopSettings>) {
      this.settings = {
        ...this.settings,
        ...newSettings,
      };
      await this.saveToStorage();
    },

    async updatePrintSettings(newPrintSettings: Partial<ShopSettings['printSettings']>) {
      this.settings.printSettings = {
        ...this.settings.printSettings,
        ...newPrintSettings,
      };
      this.saveToStorage();
    },
  },
});
