import { defineStore } from 'pinia';
import type { ShopSettings } from '../types';

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
  }),

  actions: {
    loadFromStorage() {
      const raw = localStorage.getItem('shopSettings');
      if (raw) {
        this.settings = JSON.parse(raw);
      }
    },

    saveToStorage() {
      localStorage.setItem('shopSettings', JSON.stringify(this.settings));
    },

    updateSettings(newSettings: Partial<ShopSettings>) {
      this.settings = {
        ...this.settings,
        ...newSettings,
      };
      this.saveToStorage();
    },

    updatePrintSettings(newPrintSettings: Partial<ShopSettings['printSettings']>) {
      this.settings.printSettings = {
        ...this.settings.printSettings,
        ...newPrintSettings,
      };
      this.saveToStorage();
    },
  },
});
