import { defineStore } from 'pinia';
import type { Product } from '../types';
import { apiClient } from '../services/api';

export const useProductStore = defineStore('products', {
  state: () => ({
    products: [] as Product[],
    isLoading: false,
    error: null as string | null,
  }),

  actions: {
    loadFromStorage() {
      // Load products from API (which uses localStorage)
      this.loadProducts();
    },

    async loadProducts(category?: string) {
      this.isLoading = true;
      this.error = null;
      try {
        const result = await apiClient.getProducts(category);
        if ((result as any).error) {
          this.error = (result as any).error;
          return;
        }
        this.products = result.data?.products || [];
      } catch (error: any) {
        this.error = error.message;
      } finally {
        this.isLoading = false;
      }
    },

    async addProduct(product: Product) {
      this.isLoading = true;
      this.error = null;
      try {
        const result = await apiClient.createProduct(product);
        if ((result as any).error) {
          this.error = (result as any).error;
          return { success: false };
        }
        const newProduct = result.data?.product;
        if (newProduct) {
          this.products.push(newProduct);
        }
        return { success: true };
      } catch (error: any) {
        this.error = error.message;
        return { success: false };
      } finally {
        this.isLoading = false;
      }
    },

    async updateProduct(id: string, product: Product) {
      this.isLoading = true;
      this.error = null;
      try {
        const result = await apiClient.updateProduct(id, product);
        if ((result as any).error) {
          this.error = (result as any).error;
          return { success: false };
        }
        const index = this.products.findIndex((p) => p.id === id);
        const updatedProduct = result.data?.product;
        if (index !== -1 && updatedProduct) {
          this.products[index] = updatedProduct;
        }
        return { success: true };
      } catch (error: any) {
        this.error = error.message;
        return { success: false };
      } finally {
        this.isLoading = false;
      }
    },

    async deleteProduct(id: string) {
      this.isLoading = true;
      this.error = null;
      try {
        const result = await apiClient.deleteProduct(id);
        if (result.error) {
          this.error = result.error;
          return { success: false };
        }
        this.products = this.products.filter((p) => p.id !== id);
        return { success: true };
      } catch (error: any) {
        this.error = error.message;
        return { success: false };
      } finally {
        this.isLoading = false;
      }
    },
  },
});