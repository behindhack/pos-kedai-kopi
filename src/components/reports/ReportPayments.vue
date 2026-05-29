<template>
  <div class="report-section">
    <h3 class="section-header">IV. RINCIAN METODE PEMBAYARAN</h3>
    <div class="payment-detail-table">
      <div class="table-header">
        <div class="col-method">Metode Pembayaran</div>
        <div class="col-count">Jumlah</div>
        <div class="col-amount">Nominal</div>
        <div class="col-percent">Persentase</div>
      </div>
      <div class="table-rows">
        <div v-for="stat in salesByPaymentMethod" :key="stat.method" class="table-row">
          <div class="col-method">
            <span :class="['payment-badge', 'badge-' + stat.method.toLowerCase()]">
              {{ formatPaymentMethod(stat.method) }}
            </span>
          </div>
          <div class="col-count">{{ stat.count }} transaksi</div>
          <div class="col-amount"><strong>{{ formatCurrency(stat.total) }}</strong></div>
          <div class="col-percent">
            <div class="progress-bar-container">
              <div class="progress-bar" :style="{ width: stat.percentage + '%' }"></div>
              <span>{{ stat.percentage.toFixed(1) }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PaymentMethod } from '../../types';

interface PaymentStat {
  method: string;
  count: number;
  total: number;
  percentage: number;
}

defineProps<{
  salesByPaymentMethod: PaymentStat[];
  formatCurrency: (value: number) => string;
  formatPaymentMethod: (method: string) => string;
}>();
</script>

<style scoped>
.report-section {
  margin-bottom: 30px;
}
.section-header {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--app-border);
  color: var(--app-text);
}
.payment-detail-table {
  border: 1px solid var(--app-border);
  border-radius: 8px;
  overflow: hidden;
}
.table-header {
  display: flex;
  background: var(--app-background);
  padding: 12px 16px;
  font-weight: 600;
  font-size: 13px;
  color: var(--app-text-muted);
  border-bottom: 1px solid var(--app-border);
}
.table-row {
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid var(--app-border);
  align-items: center;
  font-size: 14px;
}
.table-row:last-child {
  border-bottom: none;
}
.col-method { flex: 2; }
.col-count { flex: 1; color: var(--app-text-muted); }
.col-amount { flex: 2; }
.col-percent { flex: 2; }

.payment-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}
.badge-cash { background: #e3f2fd; color: #1976d2; }
.badge-qris { background: #ffebee; color: #d32f2f; }
.badge-transfer { background: #e8f5e9; color: #388e3c; }

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 10px;
}
.progress-bar {
  height: 6px;
  background: #c26b2d;
  border-radius: 3px;
  flex: 1;
}
.progress-bar-container span {
  font-size: 12px;
  color: var(--app-text-muted);
  width: 40px;
}
</style>
