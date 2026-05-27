import { defineStore } from 'pinia';
import type { FinancialReport, ProfitLossCalculation } from '../types';
import { apiClient } from '../services/api';

export const useFinancialReportsStore = defineStore('financialReports', {
  state: () => ({
    reports: [] as FinancialReport[],
    latestMetrics: null as any,
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    getReportById: (state) => (id: string) => {
      return state.reports.find((r) => r.id === id);
    },

    getReportsCount: (state) => state.reports.length,

    getLatestReport: (state) => {
      return state.reports.length > 0 ? state.reports[0] : null;
    },

    getTotalNetProfit: (state) => {
      return state.reports.reduce((sum, r) => sum + r.netProfit, 0);
    },

    getAverageProfitMargin: (state) => {
      if (state.reports.length === 0) return 0;
      const totalMargin = state.reports.reduce((sum, r) => {
        const margin = r.netRevenue > 0 ? (r.netProfit / r.netRevenue) * 100 : 0;
        return sum + margin;
      }, 0);
      return totalMargin / state.reports.length;
    },
  },

  actions: {
    async loadFinancialReports(storeId: string, startDate?: string, endDate?: string) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiClient.getFinancialReports(storeId, startDate, endDate);
        if ((response as any).error) {
          this.error = (response as any).error;
          return;
        }
        this.reports = (response.data || []) as FinancialReport[];
      } catch (error: any) {
        this.error = error.message || 'Failed to load financial reports';
      } finally {
        this.isLoading = false;
      }
    },

    async createFinancialReport(report: Omit<FinancialReport, 'id'>) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiClient.createFinancialReport(report);
        if ((response as any).error) {
          this.error = (response as any).error;
          return null;
        }
        const newReport = response.data as FinancialReport;
        this.reports.unshift(newReport);
        return newReport;
      } catch (error: any) {
        this.error = error.message || 'Failed to create financial report';
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    async calculateProfitLoss(data: any): Promise<ProfitLossCalculation | null> {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiClient.calculateProfitLoss(data);
        if ((response as any).error) {
          this.error = (response as any).error;
          return null;
        }
        return response.data as ProfitLossCalculation;
      } catch (error: any) {
        this.error = error.message || 'Failed to calculate profit/loss';
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    async getLatestMetrics(storeId: string) {
      try {
        const response = await apiClient.getLatestFinancialMetrics(storeId);
        if ((response as any).error) {
          this.error = (response as any).error;
          return null;
        }
        this.latestMetrics = response.data;
        return response.data;
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch metrics';
        return null;
      }
    },

    async updateFinancialReport(id: string, updates: Partial<FinancialReport>) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiClient.updateFinancialReport(id, updates);
        if ((response as any).error) {
          this.error = (response as any).error;
          return null;
        }
        const updatedReport = response.data as FinancialReport;
        const index = this.reports.findIndex((r) => r.id === id);
        if (index !== -1) {
          this.reports[index] = updatedReport;
        }
        return updatedReport;
      } catch (error: any) {
        this.error = error.message || 'Failed to update financial report';
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteFinancialReport(id: string) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiClient.deleteFinancialReport(id);
        if ((response as any).error) {
          this.error = (response as any).error;
          return false;
        }
        this.reports = this.reports.filter((r) => r.id !== id);
        return true;
      } catch (error: any) {
        this.error = error.message || 'Failed to delete financial report';
        return false;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
