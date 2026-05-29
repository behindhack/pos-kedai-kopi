<template>
  <div class="report-section">
    <h3 class="section-header">I. RINGKASAN PENJUALAN</h3>
    <div class="summary-grid">
      <div class="summary-item">
        <span>Periode</span>
        <strong>{{ reportPeriodText }}</strong>
      </div>
      <div class="summary-item">
        <span>Total Transaksi</span>
        <strong>{{ totalTransactions }} trans.</strong>
      </div>
      <div class="summary-item">
        <span>Penjualan Kotor</span>
        <strong>{{ formatCurrency(grossRevenue) }}</strong>
      </div>
      <div class="summary-item">
        <span>Total Diskon</span>
        <strong>{{ formatCurrency(totalDiscount) }}</strong>
      </div>
      <div class="summary-item">
        <span>Total Pajak</span>
        <strong>{{ formatCurrency(totalTax) }}</strong>
      </div>
      <div class="summary-item highlight">
        <span>Penjualan Bersih</span>
        <strong>{{ formatCurrency(netRevenue) }}</strong>
      </div>
      <div class="summary-item">
        <span>Rata-rata Transaksi</span>
        <strong>{{ formatCurrency(averageTransaction) }}</strong>
      </div>
      <div class="summary-item">
        <span>Rata-rata Item/Trans</span>
        <strong>{{ averageItems.toFixed(2) }}</strong>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  reportPeriodText: string;
  totalTransactions: number;
  grossRevenue: number;
  totalDiscount: number;
  totalTax: number;
  netRevenue: number;
  averageTransaction: number;
  averageItems: number;
  formatCurrency: (value: number) => string;
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
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.summary-item {
  background: var(--app-background);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--app-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.summary-item span {
  font-size: 13px;
  color: var(--app-text-muted);
}
.summary-item strong {
  font-size: 18px;
  color: var(--app-text);
}
.summary-item.highlight {
  background: #fff8f3;
  border-color: #c26b2d;
}
.summary-item.highlight span {
  color: #c26b2d;
  font-weight: 600;
}
.summary-item.highlight strong {
  color: #c26b2d;
  font-size: 22px;
}

@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
