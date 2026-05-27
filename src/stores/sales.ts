import { defineStore } from 'pinia';
import type { CartItem, Sale, OrderType, PaymentMethod } from '../types';
import { apiClient } from '../services/api';

export const useSalesStore = defineStore('sales', {
  state: () => ({
    currentCart: [] as CartItem[],
    currentOrderType: 'DINE_IN' as OrderType,
    currentCustomerName: '',
    dailySales: [] as Sale[],
    taxPercent: 0,
    discountAmount: 0, // Fixed discount amount in IDR
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    subtotal: (state) =>
      state.currentCart.reduce((sum, item) => {
        const variantExtra = item.selectedVariantIds.reduce((acc, variantId) => {
          const variant = item.product.variants?.find((v) => v.id === variantId);
          return acc + (variant?.extraPrice || 0);
        }, 0);
        return sum + (item.product.basePrice + variantExtra) * item.qty;
      }, 0),
    taxAmount(): number {
      return ((this.subtotal - this.discountAmount) * this.taxPercent) / 100;
    },
    total(): number {
      return this.subtotal - this.discountAmount + this.taxAmount;
    },
  },

  actions: {
    loadFromStorage() {
      const raw = localStorage.getItem('sales');
      if (raw) this.dailySales = JSON.parse(raw);
    },

    async loadSalesReport(startDate?: string, endDate?: string) {
      this.isLoading = true;
      this.error = null;
      try {
        const result = await apiClient.getSalesReport(startDate, endDate);
        if ((result as any).error) {
          this.error = (result as any).error;
          return;
        }
        // Ensure sales are sorted by date
        const sortedSales = ((result.data?.sales || []) as Sale[]).sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        this.dailySales = sortedSales;
      } catch (error: any) {
        this.error = error.message;
      } finally {
        this.isLoading = false;
      }
    },

    addToCart(item: CartItem) {
      this.currentCart.push(item);
    },

    clearCart() {
      this.currentCart = [];
      this.currentCustomerName = '';
      this.currentOrderType = 'DINE_IN';
    },

    removeFromCart(index: number) {
      this.currentCart.splice(index, 1);
    },

    updateCartItem(index: number, qty: number) {
      if (qty <= 0) {
        this.removeFromCart(index);
      } else {
        this.currentCart[index].qty = qty;
      }
    },

    setDiscount(amount: number) {
      this.discountAmount = Math.max(0, Math.min(amount, this.subtotal));
    },

    setTax(percent: number) {
      this.taxPercent = Math.max(0, Math.min(percent, 100));
    },

    async finalizeSale(method: PaymentMethod, paidAmount: number) {
      this.isLoading = true;
      this.error = null;
      try {
        const saleData = {
          customerName: this.currentCustomerName,
          orderType: this.currentOrderType,
          items: this.currentCart, // Send the full items so API stores complete data
          subtotal: this.subtotal,
          discount: this.discountAmount,
          tax: this.taxAmount,
          total: this.total,
          paymentMethod: method,
          paidAmount,
        };

        const result = await apiClient.createSale(saleData);

        // Generate daily order number
        const todayStr = new Date().toISOString().split('T')[0];
        const counterKey = `order_counter_${todayStr}`;
        let currentCounter = parseInt(localStorage.getItem(counterKey) || '0', 10);
        currentCounter++;
        localStorage.setItem(counterKey, currentCounter.toString());

        // Create proper Sale object with complete structure
        const sale: Sale = {
          id: (result.data?.sale?.id as string) || Date.now().toString(),
          orderNumber: currentCounter,
          date: (result.data?.sale?.date as string) || new Date().toISOString(),
          customerName: this.currentCustomerName || (result.data?.sale?.customerName as string | undefined),
          orderType: this.currentOrderType,
          items: this.currentCart,
          subtotal: this.subtotal,
          discount: this.discountAmount,
          tax: this.taxAmount,
          total: this.total,
          payment: {
            method,
            paidAmount,
            change: paidAmount - this.total,
          },
          status: 'PENDING',
        };
        
        // Save the updated sale object with orderNumber and status back via API or update local array
        // Since we are replacing the API's version in localstorage anyway (legacy code), we'll do this:
        this.dailySales.unshift(sale); // Add to top
        localStorage.setItem('sales', JSON.stringify(this.dailySales));

        // Notify other tabs (e.g. Barista)
        try {
          const bc = new BroadcastChannel('pos-sales-updates');
          bc.postMessage({ type: 'NEW_SALE', saleId: sale.id });
          bc.close();
        } catch (e) {
          console.warn('BroadcastChannel not supported');
        }

        this.clearCart();
        this.discountAmount = 0;
        this.taxPercent = 0;

        return {
          success: true,
          sale,
          change: paidAmount - this.total,
        };
      } catch (error: any) {
        this.error = error.message;
        return { success: false, error: error.message };
      } finally {
        this.isLoading = false;
      }
    },
    
    // Add method to update order status
    updateOrderStatus(saleId: string, newStatus: string) {
      const saleIndex = this.dailySales.findIndex(s => s.id === saleId);
      if (saleIndex !== -1) {
        this.dailySales[saleIndex].status = newStatus as any;
        localStorage.setItem('sales', JSON.stringify(this.dailySales));
        
        try {
          const bc = new BroadcastChannel('pos-sales-updates');
          bc.postMessage({ type: 'STATUS_UPDATE', saleId, status: newStatus });
          bc.close();
        } catch (e) {}
      }
    }
  },
});