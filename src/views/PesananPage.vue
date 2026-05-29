<template>
  <ion-page>
    <ion-header class="pesanan-header">
      <ion-toolbar>
        <div class="toolbar-inner">
          <div class="header-title">
            <h1 style="display: flex; align-items: center; gap: 8px;"><ion-icon :icon="cafeOutline"></ion-icon> Pesanan Pelanggan</h1>
            <p>Kelola pemesanan minuman & makanan</p>
          </div>
          <div class="order-stats">
            <div class="stat pending">{{ pendingCount }}</div>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="pesanan-content">
      <ion-grid fixed>
        <!-- Status Filter -->
        <ion-row class="ion-margin-bottom">
          <ion-col size="12">
            <div class="status-filter" role="tablist" aria-label="Filter pesanan berdasarkan status">
              <button 
                v-for="status in orderStatuses" 
                :key="status.value"
                :class="['filter-btn', { active: selectedStatus === status.value }]"
                :aria-label="`Filter pesanan dengan status ${status.label}, total ${getCountByStatus(status.value)} pesanan`"
                :aria-selected="selectedStatus === status.value"
                role="tab"
                @click="selectedStatus = status.value"
              >
                <span class="status-label">{{ status.label }}</span>
                <span v-if="getCountByStatus(status.value) > 0" class="status-count">
                  {{ getCountByStatus(status.value) }}
                </span>
              </button>
            </div>
          </ion-col>
        </ion-row>

        <!-- Loading State -->
        <ion-row v-if="isLoading">
          <ion-col size="12" class="empty-state">
            <div class="loading-spinner">
              <ion-spinner name="crescent" color="primary"></ion-spinner>
            </div>
            <p>Memuat pesanan...</p>
          </ion-col>
        </ion-row>

        <!-- Orders Queue -->
        <ion-row v-if="!isLoading">
          <ion-col size="12" v-if="filteredOrders.length === 0" class="empty-state">
            <div class="empty-icon"><ion-icon :icon="sparklesOutline"></ion-icon></div>
            <h3>Tidak ada pesanan</h3>
            <p>Status: {{ getStatusLabel(selectedStatus) }}</p>
            <p class="empty-hint">Pesanan baru akan tampil di sini</p>
          </ion-col>

          <ion-col 
            size="12" 
            size-md="6" 
            size-lg="4"
            v-for="order in filteredOrders" 
            :key="order.id" 
            class="ion-margin-bottom"
          >
            <div 
              class="order-queue-card" 
              :class="`status-${order.status.toLowerCase()}`"
              :aria-label="`Pesanan nomor ${order.id.slice(-4).toUpperCase()} untuk ${order.customerName}`"
              role="article"
            >
              <!-- Order Header -->
              <div class="order-queue-header">
                <div class="order-number">
                  <span class="number">#{{ order.id.slice(-4).toUpperCase() }}</span>
                  <span class="time">{{ formatTime(order.createdAt) }}</span>
                </div>
                <div :class="['status-badge', order.status.toLowerCase()]">
                  {{ getStatusLabel(order.status) }}
                </div>
              </div>

              <!-- Customer Info -->
              <div class="customer-info">
                <ion-icon :icon="personCircleOutline" />
                <span>{{ order.customerName || 'Walk-in Customer' }}</span>
              </div>

              <!-- Items to Prepare -->
              <div class="items-section">
                <div class="section-title">
                  <ion-icon :icon="listOutline" />
                  <span>Pesanan ({{ order.items.length }})</span>
                </div>
                <div class="items-list">
                  <div 
                    v-for="(item, i) in order.items" 
                    :key="i" 
                    class="order-item"
                  >
                    <div class="item-header">
                      <span class="item-qty">{{ item.qty }}x</span>
                      <span class="item-name">{{ item.product.name }}</span>
                    </div>
                    <div v-if="item.note" class="item-notes">
                      <ion-icon :icon="documentTextOutline" style="vertical-align: middle;"></ion-icon> {{ item.note }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Order Timer -->
              <div class="order-timer">
                <ion-icon :icon="timeOutline" />
                <span>{{ getOrderDuration(order.createdAt) }}</span>
              </div>

              <!-- Action Buttons -->
              <div class="action-buttons">
                <ion-button
                  v-if="order.status === 'PENDING'"
                  expand="block"
                  color="warning"
                  size="small"
                  class="action-btn"
                  aria-label="Mulai membuat pesanan"
                  @click="updateOrderStatus(order.id, 'PREPARING')"
                >
                  <ion-icon slot="start" :icon="flame" />
                  Mulai Buat
                </ion-button>

                <ion-button
                  v-else-if="order.status === 'PREPARING'"
                  expand="block"
                  color="success"
                  size="small"
                  class="action-btn"
                  aria-label="Tandai pesanan siap diambil"
                  @click="updateOrderStatus(order.id, 'READY')"
                >
                  <ion-icon slot="start" :icon="checkmarkCircleOutline" />
                  Siap Ambil
                </ion-button>

                <ion-button
                  v-else-if="order.status === 'READY'"
                  expand="block"
                  fill="outline"
                  color="success"
                  size="small"
                  class="action-btn"
                  aria-label="Tandai pesanan selesai dan hapus dari antrian"
                  @click="completeOrder(order.id)"
                >
                  <ion-icon slot="start" :icon="checkmarkDoneCircleOutline" />
                  Selesai
                </ion-button>
              </div>
            </div>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>

    <!-- Success Toast Notification -->
    <ion-toast
      :is-open="showToast"
      :message="toastMessage"
      :duration="2000"
      position="bottom"
      @didDismiss="showToast = false"
    />
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonToast,
  IonSpinner,
  onIonViewWillEnter,
  onIonViewWillLeave
} from '@ionic/vue';
import {
  timeOutline,
  flame,
  checkmarkCircleOutline,
  checkmarkDoneCircleOutline,
  personCircleOutline,
  listOutline,
  cafeOutline,
  sparklesOutline,
  documentTextOutline,
} from 'ionicons/icons';
import { ref, computed } from 'vue';
import { useSalesStore } from '../stores/sales';
import { formatTime } from '../utils/formatters';
import type { Sale } from '../types';

const sales = useSalesStore();

// State
const selectedStatus = ref<'PENDING' | 'PREPARING' | 'READY'>('PENDING');
const showToast = ref(false);
const toastMessage = ref('');
const currentTime = ref(new Date());
let timeInterval: ReturnType<typeof setInterval> | null = null;

const orderStatuses: Array<{ value: 'PENDING' | 'PREPARING' | 'READY'; label: string }> = [
  { value: 'PENDING', label: 'Menunggu' },
  { value: 'PREPARING', label: 'Sedang Dibuat' },
  { value: 'READY', label: 'Siap Ambil' },
];

interface OrderWithStatus extends Sale {
  status: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED';
  createdAt: string;
}

const orders = ref<OrderWithStatus[]>([]);
const isLoading = ref(true);

let bc: BroadcastChannel | null = null;

onIonViewWillEnter(() => {
  loadOrders();
  isLoading.value = false;
  
  // Update current time every 15 seconds for timer (reduce re-renders)
  timeInterval = setInterval(() => {
    currentTime.value = new Date();
  }, 15000);

  try {
    bc = new BroadcastChannel('pos-sales-updates');
    bc.onmessage = (event) => {
      if (event.data && (event.data.type === 'NEW_SALE' || event.data.type === 'STATUS_UPDATE')) {
        loadOrders(false); // reload when a new sale is broadcasted (silent)
      }
    };
  } catch (e) {
    console.warn('BroadcastChannel not supported');
  }

  // Polling every 10 seconds to sync across different devices/browsers
  setInterval(() => {
    loadOrders(false);
  }, 10000);
});

onIonViewWillLeave(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
  if (bc) {
    bc.close();
  }
});

const loadOrders = async (showLoading = true) => {
  try {
    if (showLoading) isLoading.value = true;
    // Load fresh orders from sales store (from KASIR transactions)
    await sales.loadFromStorage();
    
    // Convert sales to orders
    const freshSalesOrders = sales.dailySales
      .filter(sale => {
        // Only include orders from today that haven't been completed
        const saleDate = new Date(sale.date);
        const today = new Date();
        return saleDate.toDateString() === today.toDateString();
      })
      .map((sale) => ({
        ...sale,
        status: (sale.status || 'PENDING') as 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED',
        createdAt: sale.date,
      }));

    orders.value = freshSalesOrders.filter(o => o.status !== 'COMPLETED');
  } catch (error) {
    console.error('Failed to load orders:', error);
    orders.value = [];
  } finally {
    isLoading.value = false;
  }
};



const saveOrders = () => {
  // Obsolete: We no longer save to localStorage, state is synced with backend
};

const filteredOrders = computed(() => {
  return orders.value.filter((order) => order.status === selectedStatus.value);
});

const pendingCount = computed(() => {
  return orders.value.filter((o) => o.status === 'PENDING').length;
});

const getCountByStatus = (status: string): number => {
  return orders.value.filter((o) => o.status === status).length;
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return 'Menunggu';
    case 'PREPARING':
      return 'Sedang Dibuat';
    case 'READY':
      return 'Siap Ambil';
    case 'COMPLETED':
      return 'Selesai';
    default:
      return status;
  }
};


const getOrderDuration = (dateString: string): string => {
  const orderTime = new Date(dateString).getTime();
  const duration = Math.floor((currentTime.value.getTime() - orderTime) / 1000);
  
  if (duration < 60) {
    return `${duration}s`;
  } else if (duration < 3600) {
    return `${Math.floor(duration / 60)}m`;
  } else {
    return `${Math.floor(duration / 3600)}h`;
  }
};

const updateOrderStatus = async (
  orderId: string,
  newStatus: 'PREPARING' | 'READY'
) => {
  const order = orders.value.find((o) => o.id === orderId);
  if (order) {
    order.status = newStatus;
    toastMessage.value = `Pesanan diubah ke: ${getStatusLabel(newStatus)}`;
    showToast.value = true;
    await sales.updateOrderStatus(orderId, newStatus);
  }
};

const completeOrder = async (orderId: string) => {
  const index = orders.value.findIndex((o) => o.id === orderId);
  if (index > -1) {
    const order = orders.value[index];
    order.status = 'COMPLETED';
    toastMessage.value = `Pesanan #${order.id.slice(-4).toUpperCase()} selesai!`;
    showToast.value = true;
    
    // Call the API to mark it completed
    await sales.updateOrderStatus(orderId, 'COMPLETED');
  }
};
</script>

<style scoped>
.pesanan-header ion-toolbar {
  --background: linear-gradient(135deg, #c26b2d 0%, #e58b43 100%);
  --color: white;
  box-shadow: 0 4px 16px rgba(194, 107, 45, 0.2);
}

.toolbar-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 8px 0;
}

.header-title h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: white;
}

.header-title p {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.order-stats {
  display: flex;
  gap: 12px;
  align-items: center;
}

.stat {
  background: rgba(255, 255, 255, 0.3);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.pesanan-content {
  --background: var(--ion-background-color);
}

.status-filter {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 12px 0;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 2px solid var(--app-border);
  background: var(--app-panel);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--app-text);
}

.filter-btn:hover {
  border-color: var(--app-primary);
  background: var(--app-soft-bg);
}

.filter-btn.active {
  background: var(--app-primary);
  border-color: var(--app-primary);
  color: white;
}

.status-label {
  flex: 1;
}

.status-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.filter-btn.active .status-count {
  background: rgba(255, 255, 255, 0.3);
}

.empty-state {
  text-align: center;
  padding: 48px 16px;
  color: var(--app-muted);
}

.empty-icon {
  font-size: 56px;
  margin-bottom: 16px;
  display: block;
}

.empty-state h3 {
  margin: 12px 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--app-text);
}

.empty-state p {
  font-size: 14px;
  margin: 4px 0;
  color: var(--app-muted);
}

.empty-hint {
  font-size: 12px;
  margin-top: 12px;
  opacity: 0.7;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
}

.order-queue-card {
  background: var(--app-panel);
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--app-soft-shadow);
  border-left: 5px solid #ddd;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-queue-card:hover {
  box-shadow: var(--app-medium-shadow);
  transform: translateY(-2px);
}

.order-queue-card.status-pending {
  border-left-color: #ff6b6b;
  background: rgba(255, 107, 107, 0.05);
}

.order-queue-card.status-preparing {
  border-left-color: #ffa726;
  background: rgba(255, 167, 38, 0.05);
}

.order-queue-card.status-ready {
  border-left-color: #66bb6a;
  background: rgba(102, 187, 106, 0.05);
}

.order-queue-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.order-number {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.number {
  font-size: 16px;
  font-weight: 700;
  color: var(--app-text);
}

.time {
  font-size: 12px;
  color: var(--app-muted);
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.pending {
  background: #ef4444;
  color: #ffffff;
}

.status-badge.preparing {
  background: #f59e0b;
  color: #ffffff;
}

.status-badge.ready {
  background: #10b981;
  color: #ffffff;
}

.customer-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--app-text);
  padding: 8px;
  background: var(--ion-background-color);
  border-radius: 6px;
}

.customer-info ion-icon {
  font-size: 18px;
  color: var(--app-primary);
}

.items-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--app-muted);
}

.section-title ion-icon {
  font-size: 14px;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  background: var(--ion-background-color);
  border-radius: 6px;
  border: 1px solid var(--app-border);
}

.order-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--app-border);
}

.order-item:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.item-header {
  display: flex;
  gap: 8px;
  align-items: center;
}

.item-qty {
  font-weight: 700;
  font-size: 14px;
  color: var(--app-primary);
  min-width: 32px;
  text-align: center;
  background: rgba(194, 107, 45, 0.1);
  border-radius: 4px;
  padding: 2px 6px;
}

.item-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--app-text);
  flex: 1;
}

.item-notes {
  font-size: 12px;
  color: var(--app-muted);
  padding: 4px 8px;
  background: rgba(255, 193, 7, 0.1);
  border-radius: 4px;
  border-left: 2px solid #ffc107;
  margin-left: 8px;
}

.order-timer {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--app-muted);
  padding: 6px 8px;
  background: var(--ion-background-color);
  border-radius: 6px;
}

.order-timer ion-icon {
  font-size: 14px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--app-border);
}

.action-btn {
  --padding-top: 6px;
  --padding-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
  --color: #ffffff; /* Force text to white for contrast */
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-title h1 {
    font-size: 16px;
  }

  .header-title p {
    font-size: 11px;
  }

  .order-queue-card {
    padding: 12px;
    gap: 10px;
  }

  .status-filter {
    gap: 6px;
  }

  .filter-btn {
    padding: 6px 10px;
    font-size: 13px;
  }

  .number {
    font-size: 14px;
  }
}

/* Extra Small Screens */
@media (max-width: 480px) {
  .pesanan-header ion-toolbar {
    padding: 0;
  }

  .toolbar-inner {
    flex-direction: column;
    gap: 8px;
  }

  .order-stats {
    width: 100%;
    justify-content: flex-start;
  }

  .stat {
    font-size: 12px;
    padding: 3px 8px;
  }

  .header-title h1 {
    font-size: 14px;
  }

  .header-title p {
    font-size: 10px;
  }

  .status-filter {
    gap: 4px;
  }

  .filter-btn {
    padding: 5px 8px;
    font-size: 12px;
    min-width: auto;
  }

  .order-queue-card {
    padding: 10px;
    gap: 8px;
  }

  .number {
    font-size: 13px;
  }

  .status-badge {
    font-size: 10px;
    padding: 4px 8px;
  }

  .customer-info {
    font-size: 12px;
    padding: 6px;
  }

  .items-list {
    padding: 6px;
  }

  .item-qty {
    font-size: 12px;
    min-width: 28px;
    padding: 1px 4px;
  }

  .item-name {
    font-size: 12px;
  }

  .order-timer {
    font-size: 11px;
    padding: 4px 6px;
  }

  .action-btn {
    --padding-top: 5px;
    --padding-bottom: 5px;
    font-size: 12px;
  }

  .empty-state {
    padding: 32px 12px;
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  .empty-state h3 {
    font-size: 16px;
    margin: 8px 0 6px 0;
  }

  .empty-state p {
    font-size: 12px;
    margin: 2px 0;
  }
}

/* Accessibility - Focus Styles */
.filter-btn:focus,
.action-btn:focus {
  outline: 2px solid var(--app-primary);
  outline-offset: 2px;
}

/* Improve contrast for readability */
.order-queue-card {
  outline: none;
}

.order-queue-card:focus-within {
  box-shadow: inset 0 0 0 2px var(--app-primary);
}

.items-list {
  padding: 6px;
  gap: 6px;
}

.action-btn {
  --padding-top: 4px;
  --padding-bottom: 4px;
  font-size: 12px;
}

@media (max-width: 480px) {
  .pesanan-header ion-toolbar {
    padding: 8px;
  }

  .toolbar-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .header-title h1 {
    font-size: 14px;
  }

  .header-title p {
    font-size: 10px;
  }

  .order-stats {
    align-self: flex-start;
  }

  .stat {
    padding: 3px 10px;
    font-size: 12px;
  }

  .order-queue-card {
    padding: 10px;
    gap: 8px;
  }

  .status-filter {
    gap: 4px;
  }

  .filter-btn {
    padding: 5px 8px;
    font-size: 12px;
  }

  .number {
    font-size: 13px;
  }

  .section-title {
    font-size: 11px;
  }

  .item-name {
    font-size: 12px;
  }

  .item-qty {
    min-width: 28px;
    font-size: 13px;
  }
}
</style>
