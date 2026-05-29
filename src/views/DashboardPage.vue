<template>
  <ion-page>
    <ion-header class="page-header">
      <ion-toolbar>
        <div class="toolbar-inner">
          <div class="brand-box">
            <div class="brand-logo"><ion-icon :icon="handRightOutline" style="color: #c26b2d;"></ion-icon></div>
            <div>
              <h1>Halo, {{ auth.currentUser?.name || 'Admin' }}!</h1>
              <p>Ringkasan Performa Kedai Kopi Hari Ini</p>
            </div>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="page-content">
      <div class="dashboard-shell">
        <!-- Quick Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon income-icon">
              <ion-icon :icon="walletOutline" />
            </div>
            <div class="stat-info">
              <h3>Pendapatan Hari Ini</h3>
              <h2>{{ formatCurrency(todayRevenue) }}</h2>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon order-icon">
              <ion-icon :icon="receiptOutline" />
            </div>
            <div class="stat-info">
              <h3>Total Pesanan</h3>
              <h2>{{ todayOrdersCount }} <small>transaksi</small></h2>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon product-icon">
              <ion-icon :icon="cafeOutline" />
            </div>
            <div class="stat-info">
              <h3>Menu Terlaris</h3>
              <h2 class="top-product">{{ topSellingProduct || '-' }}</h2>
            </div>
          </div>
        </div>

        <!-- Recent Activity Placeholder -->
        <div class="activity-panel">
          <div class="panel-header">
            <h3>Aktivitas Terkini</h3>
          </div>
          <div v-if="recentSales.length === 0" class="empty-state">
            <ion-icon :icon="cartOutline" />
            <p>Belum ada transaksi hari ini.</p>
          </div>
          <div v-else class="activity-list">
            <div v-for="sale in recentSales" :key="sale.id" class="activity-item">
              <div class="activity-avatar">
                {{ sale.customerName ? sale.customerName.charAt(0).toUpperCase() : '#' }}
              </div>
              <div class="activity-detail">
                <h4>Pesanan #{{ sale.orderNumber }}</h4>
                <p>{{ sale.customerName || 'Pelanggan' }} • {{ sale.items.length }} Item</p>
              </div>
              <div class="activity-amount">
                +{{ formatCurrency(sale.total) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonIcon,
} from '@ionic/vue';
import {
  walletOutline,
  receiptOutline,
  cafeOutline,
  cartOutline,
  handRightOutline,
} from 'ionicons/icons';
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useSalesStore } from '../stores/sales';
import type { Sale } from '../types';

const auth = useAuthStore();
const salesStore = useSalesStore();

onMounted(async () => {
  // Load today's sales
  const today = new Date().toISOString().split('T')[0];
  await salesStore.loadSalesReport(today, today);
});

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Calculate today's revenue
const todayRevenue = computed(() => {
  return salesStore.dailySales.reduce((sum, sale) => sum + sale.total, 0);
});

const todayOrdersCount = computed(() => salesStore.dailySales.length);

const recentSales = computed(() => {
  return [...salesStore.dailySales].slice(0, 5);
});

// Calculate Top Selling Product today
const topSellingProduct = computed(() => {
  if (salesStore.dailySales.length === 0) return null;
  const productCount: Record<string, number> = {};
  
  salesStore.dailySales.forEach((sale) => {
    sale.items.forEach((item) => {
      productCount[item.product.name] = (productCount[item.product.name] || 0) + item.qty;
    });
  });

  let topProduct = '';
  let maxQty = 0;
  for (const [name, qty] of Object.entries(productCount)) {
    if (qty > maxQty) {
      maxQty = qty;
      topProduct = name;
    }
  }
  return topProduct;
});
</script>

<style scoped>
.page-header {
  background: var(--app-background);
}

.toolbar-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
}

.brand-box {
  display: flex;
  align-items: center;
  gap: 16px;
}

.brand-logo {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: rgba(194, 107, 45, 0.1);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.brand-box h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--app-text);
  letter-spacing: -0.5px;
}

.brand-box p {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--app-text-muted);
}

.dashboard-shell {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: var(--app-panel);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--app-border);
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.income-icon {
  background: rgba(46, 213, 115, 0.1);
  color: #2ed573;
}

.order-icon {
  background: rgba(55, 66, 250, 0.1);
  color: #3742fa;
}

.product-icon {
  background: rgba(255, 165, 2, 0.1);
  color: #ffa502;
}

.stat-info h3 {
  margin: 0;
  font-size: 14px;
  color: var(--app-text-muted);
  font-weight: 600;
}

.stat-info h2 {
  margin: 8px 0 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--app-text);
}

.stat-info small {
  font-size: 14px;
  font-weight: 500;
  color: var(--app-text-muted);
}

.top-product {
  font-size: 18px !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.activity-panel {
  background: var(--app-panel);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--app-border);
}

.panel-header h3 {
  margin: 0 0 20px;
  font-size: 18px;
  font-weight: 600;
  color: var(--app-text);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--app-text-muted);
}

.empty-state ion-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--app-border);
}

.activity-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.activity-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--app-background);
  color: var(--app-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
}

.activity-detail {
  flex: 1;
}

.activity-detail h4 {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 600;
  color: var(--app-text);
}

.activity-detail p {
  margin: 0;
  font-size: 13px;
  color: var(--app-text-muted);
}

.activity-amount {
  font-size: 16px;
  font-weight: 700;
  color: #2ed573;
}
</style>
