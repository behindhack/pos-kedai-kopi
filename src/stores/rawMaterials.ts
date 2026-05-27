import { defineStore } from 'pinia';
import type { RawMaterial, RawMaterialCategory } from '../types';
import { apiClient } from '../services/api';

export const useRawMaterialsStore = defineStore('rawMaterials', {
  state: () => ({
    materials: [] as RawMaterial[],
    lowStockMaterials: [] as RawMaterial[],
    totalCost: 0,
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    getMaterialById: (state) => (id: string) => {
      return state.materials.find((m) => m.id === id);
    },

    getMaterialsByCategory: (state) => (category: RawMaterialCategory) => {
      return state.materials.filter((m) => m.category === category);
    },

    activeMaterials: (state) => {
      return state.materials.filter((m) => m.isActive);
    },

    getMaterialCount: (state) => state.materials.length,

    getTotalInventoryValue: (state) => {
      return state.materials.reduce((sum, m) => sum + m.totalCost, 0);
    },

    getLowStockCount: (state) => state.lowStockMaterials.length,
  },

  actions: {
    async loadRawMaterials(storeId: string) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiClient.getRawMaterials(storeId);
        if ((response as any).error) {
          this.error = (response as any).error;
          return;
        }
        this.materials = (response.data || []) as RawMaterial[];
      } catch (error: any) {
        this.error = error.message || 'Failed to load raw materials';
      } finally {
        this.isLoading = false;
      }
    },

    async loadLowStockMaterials(storeId: string) {
      this.isLoading = true;
      try {
        const response = await apiClient.getLowStockMaterials(storeId);
        if ((response as any).error) {
          this.error = (response as any).error;
          return;
        }
        this.lowStockMaterials = (response.data || []) as RawMaterial[];
      } catch (error: any) {
        this.error = error.message || 'Failed to load low stock materials';
      } finally {
        this.isLoading = false;
      }
    },

    async loadTotalCost(storeId: string) {
      try {
        const response = await apiClient.getTotalRawMaterialCost(storeId);
        if ((response as any).error) {
          this.error = (response as any).error;
          return;
        }
        this.totalCost = response.data?.totalCost || 0;
      } catch (error: any) {
        this.error = error.message || 'Failed to load total cost';
      }
    },

    async createRawMaterial(material: Omit<RawMaterial, 'id'>) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiClient.createRawMaterial(material);
        if ((response as any).error) {
          this.error = (response as any).error;
          return null;
        }
        const newMaterial = response.data as RawMaterial;
        this.materials.push(newMaterial);
        return newMaterial;
      } catch (error: any) {
        this.error = error.message || 'Failed to create raw material';
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    async updateRawMaterial(id: string, updates: Partial<RawMaterial>) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiClient.updateRawMaterial(id, updates);
        if ((response as any).error) {
          this.error = (response as any).error;
          return null;
        }
        const updatedMaterial = response.data as RawMaterial;
        const index = this.materials.findIndex((m) => m.id === id);
        if (index !== -1) {
          this.materials[index] = updatedMaterial;
        }
        return updatedMaterial;
      } catch (error: any) {
        this.error = error.message || 'Failed to update raw material';
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    async updateRawMaterialStock(id: string, quantity: number) {
      try {
        const response = await apiClient.updateRawMaterialStock(id, quantity);
        if ((response as any).error) {
          this.error = (response as any).error;
          return null;
        }
        const updatedMaterial = response.data as RawMaterial;
        const index = this.materials.findIndex((m) => m.id === id);
        if (index !== -1) {
          this.materials[index] = updatedMaterial;
        }
        return updatedMaterial;
      } catch (error: any) {
        this.error = error.message || 'Failed to update stock';
        return null;
      }
    },

    async deleteRawMaterial(id: string) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiClient.deleteRawMaterial(id);
        if ((response as any).error) {
          this.error = (response as any).error;
          return false;
        }
        this.materials = this.materials.filter((m) => m.id !== id);
        return true;
      } catch (error: any) {
        this.error = error.message || 'Failed to delete raw material';
        return false;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
