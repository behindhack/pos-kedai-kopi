<template>
  <ion-page>
    <ion-header class="page-header">
      <ion-toolbar>
        <div class="toolbar-inner">
          <div class="brand-box">
            <div class="brand-logo">📊</div>
            <div>
              <h1>Laporan Penjualan</h1>
              <p>Rekapitulasi dan Analisis Transaksi</p>
            </div>
          </div>

          <ion-button fill="clear" class="theme-btn" @click="toggleTheme" aria-label="Toggle dark mode">
            <ion-icon :icon="isDark ? sunnyOutline : moonOutline" slot="icon-only"></ion-icon>
          </ion-button>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="page-content">
      <div class="page-shell">
        <div class="panel">
          <!-- Report Type Selector -->
          <div class="filter-section">
            <h3 class="section-title">Jenis Laporan</h3>
            <div class="report-type-tabs">
              <button 
                v-for="type in reportTypes" 
                :key="type.value"
                :class="['tab-btn', { active: reportType === type.value }]"
                @click="reportType = type.value as 'daily' | 'weekly' | 'custom'"
              >
                {{ type.label }}
              </button>
            </div>
          </div>

          <!-- Date Range Filter -->
          <div class="filter-section">
            <h3 class="section-title">Periode Laporan</h3>
            <div v-if="reportType === 'daily'" class="date-filter">
              <ion-item class="date-box" lines="none">
                <ion-label>Tanggal</ion-label>
                <ion-datetime-button datetime="filterDate" />
              </ion-item>
              <ion-modal keep-contents-mounted="true">
                <ion-datetime id="filterDate" presentation="date" v-model="selectedDate" />
              </ion-modal>
            </div>

            <div v-else-if="reportType === 'weekly'" class="date-filter">
              <ion-item class="date-box" lines="none">
                <ion-label>Minggu</ion-label>
                <ion-datetime-button datetime="filterWeek" />
              </ion-item>
              <ion-modal keep-contents-mounted="true">
                <ion-datetime id="filterWeek" presentation="date" v-model="selectedDate" />
              </ion-modal>
            </div>

            <div v-else-if="reportType === 'custom'" class="date-range-filter">
              <ion-item class="date-box" lines="none">
                <ion-label>Dari Tanggal</ion-label>
                <ion-datetime-button datetime="filterStartDate" />
              </ion-item>
              <ion-modal keep-contents-mounted="true">
                <ion-datetime id="filterStartDate" presentation="date" v-model="dateRangeStart" />
              </ion-modal>

              <ion-item class="date-box" lines="none">
                <ion-label>Sampai Tanggal</ion-label>
                <ion-datetime-button datetime="filterEndDate" />
              </ion-item>
              <ion-modal keep-contents-mounted="true">
                <ion-datetime id="filterEndDate" presentation="date" v-model="dateRangeEnd" />
              </ion-modal>
            </div>
          </div>

          <!-- Main Report -->
          <div ref="reportRef" class="report-print-area">
            <!-- Report Header -->
            <div class="report-header">
              <h2>LAPORAN PENJUALAN</h2>
              <div class="report-meta">
                <div>
                  <strong>Periode:</strong>
                  <span>{{ reportPeriodText }}</span>
                </div>
                <div>
                  <strong>Tanggal Cetak:</strong>
                  <span>{{ formatDate(new Date().toISOString()) }}</span>
                </div>
              </div>
            </div>

            <!-- Summary Section -->
            <div class="report-section">
              <h3 class="section-header">I. RINGKASAN PENJUALAN</h3>
              <div class="summary-grid">
                <div class="summary-item">
                  <span>Periode</span>
                  <strong>{{ reportPeriodText }}</strong>
                </div>
                <div class="summary-item">
                  <span>Total Transaksi</span>
                  <strong>{{ daySales.length }} trans.</strong>
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

            <!-- Transaction Details Section -->
            <div class="report-section">
              <h3 class="section-header">II. RINCIAN TRANSAKSI DETAIL</h3>
              <div v-if="daySales.length > 0" class="transaction-detail-table">
                <div class="table-header transaction-header">
                  <div class="col-no">No</div>
                  <div class="col-time">Waktu</div>
                  <div class="col-customer">Pelanggan</div>
                  <div class="col-items">Item</div>
                  <div class="col-subtotal">Subtotal</div>
                  <div class="col-discount">Diskon</div>
                  <div class="col-tax">Pajak</div>
                  <div class="col-total">Total</div>
                  <div class="col-method">Metode</div>
                </div>
                <div class="table-rows">
                  <div v-for="(sale, idx) in daySales" :key="sale.id" class="table-row transaction-row">
                    <div class="col-no">{{ idx + 1 }}</div>
                    <div class="col-time">{{ formatTime(sale.date) }}</div>
                    <div class="col-customer">{{ sale.customerName || 'Walk-in' }}</div>
                    <div class="col-items">{{ sale.items.length }}</div>
                    <div class="col-subtotal">{{ formatCurrency(sale.subtotal) }}</div>
                    <div class="col-discount">{{ formatCurrency(sale.discount) }}</div>
                    <div class="col-tax">{{ formatCurrency(sale.tax) }}</div>
                    <div class="col-total"><strong>{{ formatCurrency(sale.total) }}</strong></div>
                    <div class="col-method">
                      <span :class="['payment-badge', 'badge-' + sale.payment.method.toLowerCase()]">
                        {{ formatPaymentMethod(sale.payment.method) }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="table-footer transaction-footer">
                  <div class="col-no"></div>
                  <div class="col-time"></div>
                  <div class="col-customer"><strong>TOTAL</strong></div>
                  <div class="col-items"><strong>{{ daySales.reduce((sum, s) => sum + s.items.length, 0) }}</strong></div>
                  <div class="col-subtotal"><strong>{{ formatCurrency(grossRevenue) }}</strong></div>
                  <div class="col-discount"><strong>{{ formatCurrency(totalDiscount) }}</strong></div>
                  <div class="col-tax"><strong>{{ formatCurrency(totalTax) }}</strong></div>
                  <div class="col-total"><strong style="color: #c26b2d;">{{ formatCurrency(netRevenue) }}</strong></div>
                  <div class="col-method"></div>
                </div>
              </div>
              <div v-else class="empty-message">
                <p>📭 Tidak ada transaksi untuk periode ini</p>
              </div>
            </div>

            <!-- Profit/Loss Calculation Section -->
            <div class="report-section">
              <h3 class="section-header">III. PERHITUNGAN LABA RUGI</h3>
              <div class="profitloss-form">
                <div class="form-section">
                  <h4>A. Biaya Pokok Penjualan (COGS)</h4>
                  <div class="form-row">
                    <div class="form-group">
                      <label>Stok Awal (Rp)</label>
                      <ion-input 
                        v-model.number="cogsData.openingStock"
                        type="number"
                        placeholder="0"
                      ></ion-input>
                    </div>
                    <div class="form-group">
                      <label>Pembelian (Rp)</label>
                      <ion-input 
                        v-model.number="cogsData.purchases"
                        type="number"
                        placeholder="0"
                      ></ion-input>
                    </div>
                    <div class="form-group">
                      <label>Stok Akhir (Rp)</label>
                      <ion-input 
                        v-model.number="cogsData.closingStock"
                        type="number"
                        placeholder="0"
                      ></ion-input>
                    </div>
                  </div>
                </div>

                <div class="form-section">
                  <h4>B. Biaya Operasional</h4>
                  <div class="form-row">
                    <div class="form-group">
                      <label>Listrik & Air (Rp)</label>
                      <ion-input 
                        v-model.number="expensesData.utilities"
                        type="number"
                        placeholder="0"
                      ></ion-input>
                    </div>
                    <div class="form-group">
                      <label>Sewa (Rp)</label>
                      <ion-input 
                        v-model.number="expensesData.rent"
                        type="number"
                        placeholder="0"
                      ></ion-input>
                    </div>
                    <div class="form-group">
                      <label>Gaji (Rp)</label>
                      <ion-input 
                        v-model.number="expensesData.payroll"
                        type="number"
                        placeholder="0"
                      ></ion-input>
                    </div>
                    <div class="form-group">
                      <label>Biaya Lain (Rp)</label>
                      <ion-input 
                        v-model.number="expensesData.otherExpenses"
                        type="number"
                        placeholder="0"
                      ></ion-input>
                    </div>
                  </div>
                </div>

                <div class="form-section calculation-results">
                  <h4>Hasil Perhitungan</h4>
                  <div class="result-grid">
                    <div class="result-item">
                      <span class="label">Penjualan Bersih</span>
                      <span class="value">{{ formatCurrency(netRevenue) }}</span>
                    </div>
                    <div class="result-item">
                      <span class="label">COGS</span>
                      <span class="value">{{ formatCurrency(calculatedCOGS) }}</span>
                    </div>
                    <div class="result-item highlight">
                      <span class="label">Laba Kotor</span>
                      <span class="value">{{ formatCurrency(grossProfit) }}</span>
                    </div>
                    <div class="result-item">
                      <span class="label">Total Biaya Operasional</span>
                      <span class="value">{{ formatCurrency(totalOperatingExpenses) }}</span>
                    </div>
                    <div class="result-item" :class="{ profit: netProfit >= 0, loss: netProfit < 0 }">
                      <span class="label">{{ netProfit >= 0 ? '✓ Laba Bersih' : '✗ Rugi Bersih' }}</span>
                      <span class="value">{{ formatCurrency(netProfit) }}</span>
                    </div>
                    <div class="result-item">
                      <span class="label">Margin Laba</span>
                      <span class="value">{{ profitMargin.toFixed(2) }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment Methods Section -->
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
                  <div v-for="pm in paymentMethodDetails" :key="pm.method" class="table-row">
                    <div class="col-method">{{ pm.label }}</div>
                    <div class="col-count">{{ pm.count }}</div>
                    <div class="col-amount">{{ formatCurrency(pm.amount) }}</div>
                    <div class="col-percent">{{ pm.percent.toFixed(1) }}%</div>
                  </div>
                </div>
                <div class="table-footer">
                  <div class="col-method"><strong>Total</strong></div>
                  <div class="col-count"><strong>{{ totalTransactions }}</strong></div>
                  <div class="col-amount"><strong>{{ formatCurrency(netRevenue) }}</strong></div>
                  <div class="col-percent"><strong>100%</strong></div>
                </div>
              </div>
            </div>

            <!-- Top Products Section -->
            <div class="report-section">
              <h3 class="section-header">V. PRODUK TERLARIS</h3>
              <div class="product-detail-table">
                <div class="table-header">
                  <div class="col-rank">No</div>
                  <div class="col-product">Nama Produk</div>
                  <div class="col-qty">Qty</div>
                  <div class="col-amount">Total Penjualan</div>
                </div>
                <div class="table-rows">
                  <div v-for="(m, idx) in topMenus" :key="m.name" class="table-row">
                    <div class="col-rank">{{ idx + 1 }}</div>
                    <div class="col-product">{{ m.name }}</div>
                    <div class="col-qty">{{ m.qty }}</div>
                    <div class="col-amount">{{ formatCurrency(m.total) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notes Section -->
            <div class="report-section">
              <h3 class="section-header">VI. CATATAN</h3>
              <div class="notes-area">
                <p>{{ reportNotes }}</p>
              </div>
            </div>

            <!-- Signature Section -->
            <div class="report-section">
              <h3 class="section-header">VII. PERSETUJUAN</h3>
              <div class="signature-grid">
                <div class="signature-box">
                  <div class="signature-line"></div>
                  <div class="signature-label">Kasir</div>
                  <div class="signature-date">Tgl: ___________</div>
                </div>
                <div class="signature-box">
                  <div class="signature-line"></div>
                  <div class="signature-label">Pemilik / Manager</div>
                  <div class="signature-date">Tgl: ___________</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Report Notes Input -->
          <div class="filter-section">
            <h3 class="section-title">Catatan Laporan</h3>
            <textarea 
              v-model="reportNotes"
              class="notes-input"
              placeholder="Masukkan catatan atau observasi untuk laporan ini..."
              rows="3"
            ></textarea>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <ion-button expand="block" class="export-btn" @click="exportExcel">
              <ion-icon slot="start" :icon="documentOutline"></ion-icon>
              Unduh Excel
            </ion-button>
            <ion-button expand="block" fill="outline" class="refresh-btn" @click="refreshReport">
              <ion-icon slot="start" :icon="refreshOutline"></ion-icon>
              Segarkan
            </ion-button>
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
  IonItem,
  IonLabel,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
  IonButton,
  IonIcon,
  IonInput,
  toastController,
} from '@ionic/vue';
import { sunnyOutline, moonOutline, documentOutline, refreshOutline } from 'ionicons/icons';
import { ref, computed, onMounted } from 'vue';
import * as XLSX from 'xlsx';
import { useSalesStore } from '../stores/sales';
import { useTheme } from '../composables/useTheme';
import { formatCurrency } from '../utils/formatters';
import type { Sale } from '../types';

const salesStore = useSalesStore();
const { isDark, toggleTheme } = useTheme();

const selectedDate = ref<string>(new Date().toISOString());
const dateRangeStart = ref<string>(new Date(new Date().setDate(new Date().getDate() - 7)).toISOString());
const dateRangeEnd = ref<string>(new Date().toISOString());
const reportRef = ref<HTMLElement | null>(null);
const reportType = ref<'daily' | 'weekly' | 'custom'>('daily');
const reportNotes = ref<string>('');

// Profit/Loss Data
const cogsData = ref({
  openingStock: 0,
  purchases: 0,
  closingStock: 0,
});

const expensesData = ref({
  utilities: 0,
  rent: 0,
  payroll: 0,
  otherExpenses: 0,
});

const reportTypes = [
  { value: 'daily', label: 'Harian' },
  { value: 'weekly', label: 'Mingguan' },
  { value: 'custom', label: 'Custom' },
];

onMounted(() => {
  salesStore.loadFromStorage();
});

const sameDay = (d1: string, d2: string) => {
  const a = new Date(d1);
  const b = new Date(d2);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const isInRange = (d1: string, startDate: string, endDate: string) => {
  const date = new Date(d1).getTime();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  return date >= start && date <= end;
};

const getWeekRange = (dateStr: string) => {
  const date = new Date(dateStr);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  const sunday = new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000);
  return { start: monday.toISOString(), end: sunday.toISOString() };
};

const daySales = computed<Sale[]>(() => {
  if (reportType.value === 'daily') {
    return salesStore.dailySales.filter((s) => sameDay(s.date, selectedDate.value));
  } else if (reportType.value === 'weekly') {
    const { start, end } = getWeekRange(selectedDate.value);
    return salesStore.dailySales.filter((s) => isInRange(s.date, start, end));
  } else {
    return salesStore.dailySales.filter((s) => isInRange(s.date, dateRangeStart.value, dateRangeEnd.value));
  }
});

const reportPeriodText = computed(() => {
  if (reportType.value === 'daily') {
    return formatDate(selectedDate.value);
  } else if (reportType.value === 'weekly') {
    const { start, end } = getWeekRange(selectedDate.value);
    return `${formatDate(start)} - ${formatDate(end)}`;
  } else {
    return `${formatDate(dateRangeStart.value)} - ${formatDate(dateRangeEnd.value)}`;
  }
});

const grossRevenue = computed(() => daySales.value.reduce((sum, s) => sum + s.subtotal, 0));
const totalDiscount = computed(() => daySales.value.reduce((sum, s) => sum + s.discount, 0));
const totalTax = computed(() => daySales.value.reduce((sum, s) => sum + s.tax, 0));
const netRevenue = computed(() => daySales.value.reduce((sum, s) => sum + s.total, 0));
const totalTransactions = computed(() => daySales.value.length);

const averageTransaction = computed(() => 
  totalTransactions.value > 0 ? netRevenue.value / totalTransactions.value : 0
);

const averageItems = computed(() => {
  if (totalTransactions.value === 0) return 0;
  const totalItems = daySales.value.reduce((sum, s) => sum + s.items.length, 0);
  return totalItems / totalTransactions.value;
});

const topMenus = computed(() => {
  const map = new Map<string, { name: string; qty: number; total: number }>();
  daySales.value.forEach((s) => {
    s.items.forEach((i) => {
      const key = i.product.id;
      const total = i.product.basePrice * i.qty;
      if (!map.has(key)) {
        map.set(key, { name: i.product.name, qty: i.qty, total });
      } else {
        const item = map.get(key)!;
        item.qty += i.qty;
        item.total += total;
      }
    });
  });
  return Array.from(map.values()).sort((a, b) => b.qty - a.qty).slice(0, 10);
});

const cashIn = computed(() =>
  daySales.value.filter((s) => s.payment.method === 'CASH').reduce((sum, s) => sum + s.total, 0)
);

const qrisIn = computed(() =>
  daySales.value.filter((s) => s.payment.method === 'QRIS').reduce((sum, s) => sum + s.total, 0)
);

const transferIn = computed(() =>
  daySales.value
    .filter((s) => s.payment.method === 'TRANSFER')
    .reduce((sum, s) => sum + s.total, 0)
);

const paymentMethodDetails = computed(() => {
  const cashCount = daySales.value.filter((s) => s.payment.method === 'CASH').length;
  const qrisCount = daySales.value.filter((s) => s.payment.method === 'QRIS').length;
  const transferCount = daySales.value.filter((s) => s.payment.method === 'TRANSFER').length;

  const cashPercent = netRevenue.value > 0 ? (cashIn.value / netRevenue.value) * 100 : 0;
  const qrisPercent = netRevenue.value > 0 ? (qrisIn.value / netRevenue.value) * 100 : 0;
  const transferPercent = netRevenue.value > 0 ? (transferIn.value / netRevenue.value) * 100 : 0;

  return [
    { method: 'cash', label: 'Tunai (Cash)', count: cashCount, amount: cashIn.value, percent: cashPercent },
    { method: 'qris', label: 'QRIS', count: qrisCount, amount: qrisIn.value, percent: qrisPercent },
    { method: 'transfer', label: 'Transfer', count: transferCount, amount: transferIn.value, percent: transferPercent },
  ].filter(pm => pm.count > 0 || pm.amount > 0);
});

// Profit/Loss Computed Properties
const calculatedCOGS = computed(() => {
  return cogsData.value.openingStock + cogsData.value.purchases - cogsData.value.closingStock;
});

const grossProfit = computed(() => {
  return netRevenue.value - calculatedCOGS.value;
});

const totalOperatingExpenses = computed(() => {
  return expensesData.value.utilities + expensesData.value.rent + expensesData.value.payroll + expensesData.value.otherExpenses;
});

const netProfit = computed(() => {
  return grossProfit.value - totalOperatingExpenses.value;
});

const profitMargin = computed(() => {
  return netRevenue.value > 0 ? (netProfit.value / netRevenue.value) * 100 : 0;
});

const exportExcel = async () => {
  const toast = await toastController.create({ duration: 2000, position: 'top' });

  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // ============= SHEET 1: RINGKASAN PENJUALAN =============
    const summaryData = [
      ['LAPORAN PENJUALAN'],
      [],
      ['Periode:', reportPeriodText.value],
      ['Tanggal Cetak:', formatDate(new Date().toISOString())],
      [],
      ['RINGKASAN PENJUALAN'],
      [],
      ['Deskripsi', 'Nilai'],
      ['Periode', reportPeriodText.value],
      ['Total Transaksi', totalTransactions.value],
      ['Penjualan Kotor', formatCurrency(grossRevenue.value)],
      ['Total Diskon', formatCurrency(totalDiscount.value)],
      ['Total Pajak', formatCurrency(totalTax.value)],
      ['Penjualan Bersih', formatCurrency(netRevenue.value)],
      ['Rata-rata Transaksi', formatCurrency(averageTransaction.value)],
      ['Rata-rata Item/Trans', averageItems.value.toFixed(2)],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');

    // ============= SHEET 2: METODE PEMBAYARAN =============
    const paymentData: any[][] = [
      ['RINCIAN METODE PEMBAYARAN'],
      [],
      ['Metode Pembayaran', 'Jumlah', 'Nominal', 'Persentase'],
    ];

    paymentMethodDetails.value.forEach((pm) => {
      paymentData.push([
        pm.label,
        pm.count,
        formatCurrencyRaw(pm.amount),
        pm.percent.toFixed(1) + '%',
      ]);
    });

    paymentData.push(
      [],
      ['Total', totalTransactions.value, formatCurrencyRaw(netRevenue.value), '100%']
    );

    const paymentSheet = XLSX.utils.aoa_to_sheet(paymentData);
    paymentSheet['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 20 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, paymentSheet, 'Metode Pembayaran');

    // ============= SHEET 3: PRODUK TERLARIS =============
    const productData: any[][] = [
      ['PRODUK TERLARIS'],
      [],
      ['No', 'Nama Produk', 'Qty', 'Total Penjualan'],
    ];

    topMenus.value.forEach((product, index) => {
      productData.push([
        index + 1,
        product.name,
        product.qty,
        formatCurrencyRaw(product.total),
      ]);
    });

    const productSheet = XLSX.utils.aoa_to_sheet(productData);
    productSheet['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 8 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, productSheet, 'Produk Terlaris');

    // ============= SHEET 4: CATATAN & PERSETUJUAN =============
    const notesData: any[][] = [
      ['CATATAN LAPORAN'],
      [],
      [reportNotes.value || '(Tidak ada catatan)'],
      [],
      [],
      ['PERSETUJUAN'],
      [],
      ['Kasir', '', 'Pemilik/Manager'],
      [],
      [],
      ['_________________', '', '_________________'],
      ['Nama & Tanda Tangan', '', 'Nama & Tanda Tangan'],
      ['Tanggal: ___________', '', 'Tanggal: ___________'],
    ];

    const notesSheet = XLSX.utils.aoa_to_sheet(notesData);
    notesSheet['!cols'] = [{ wch: 30 }, { wch: 10 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(workbook, notesSheet, 'Catatan & Persetujuan');

    // ============= SHEET 5: DETAIL TRANSAKSI =============
    const detailData: any[][] = [
      ['DETAIL TRANSAKSI HARIAN'],
      [],
      ['No', 'Tanggal', 'Waktu', 'Pelanggan', 'Jumlah Item', 'Subtotal', 'Diskon', 'Pajak', 'Total', 'Metode'],
    ];

    daySales.value.forEach((sale, index) => {
      const [date, time] = new Date(sale.date).toLocaleString('id-ID').split(', ');
      detailData.push([
        index + 1,
        formatDate(sale.date),
        formatTime(sale.date),
        sale.customerName || 'Walk-in',
        sale.items.length,
        formatCurrencyRaw(sale.subtotal),
        formatCurrencyRaw(sale.discount),
        formatCurrencyRaw(sale.tax),
        formatCurrencyRaw(sale.total),
        sale.payment.method === 'CASH' 
          ? 'Tunai' 
          : sale.payment.method === 'QRIS' 
          ? 'QRIS' 
          : 'Transfer',
      ]);
    });

    detailData.push(
      [],
      ['TOTAL', '', '', daySales.value.length + ' transaksi', daySales.value.reduce((sum, s) => sum + s.items.length, 0), 
       formatCurrencyRaw(grossRevenue.value), formatCurrencyRaw(totalDiscount.value), formatCurrencyRaw(totalTax.value), 
       formatCurrencyRaw(netRevenue.value), '']
    );

    const detailSheet = XLSX.utils.aoa_to_sheet(detailData);
    detailSheet['!cols'] = [
      { wch: 5 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
    ];
    XLSX.utils.book_append_sheet(workbook, detailSheet, 'Detail Transaksi');

    // ============= SHEET 6: RINCIAN ITEM DETAIL =============
    const itemDetailData: any[][] = [
      ['RINCIAN ITEM DETAIL TRANSAKSI'],
      [],
      ['No Transaksi', 'Tanggal', 'Pelanggan', 'No Item', 'Nama Item', 'Qty', 'Harga Satuan', 'Subtotal Item', 'Catatan'],
    ];

    let itemNo = 0;
    daySales.value.forEach((sale, txIndex) => {
      sale.items.forEach((item, itemIdx) => {
        itemNo++;
        const itemTotal = item.product.basePrice * item.qty;
        itemDetailData.push([
          txIndex + 1,
          formatDate(sale.date),
          sale.customerName || 'Walk-in',
          itemIdx + 1,
          item.product.name,
          item.qty,
          formatCurrencyRaw(item.product.basePrice),
          formatCurrencyRaw(itemTotal),
          item.note || '-',
        ]);
      });
    });

    const itemDetailSheet = XLSX.utils.aoa_to_sheet(itemDetailData);
    itemDetailSheet['!cols'] = [
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 8 },
      { wch: 25 },
      { wch: 6 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(workbook, itemDetailSheet, 'Rincian Item');

    // Save the workbook
    const fileName = `Laporan-Penjualan-${reportType.value}-${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast.message = 'File Excel berhasil dibuat dan diunduh';
    await toast.present();
  } catch (error) {
    toast.message = 'Gagal membuat file Excel: ' + (error as Error).message;
    await toast.present();
  }
};

const formatCurrencyRaw = (val: number) => val;

const refreshReport = async () => {
  const toast = await toastController.create({ duration: 1500, position: 'top' });
  salesStore.loadFromStorage();
  toast.message = 'Laporan telah disegarkan';
  await toast.present();
};



const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

const formatPaymentMethod = (method: string) => {
  switch (method) {
    case 'CASH':
      return 'Tunai';
    case 'QRIS':
      return 'QRIS';
    case 'TRANSFER':
      return 'Transfer';
    default:
      return method;
  }
};
</script>

<style scoped>
.page-content {
  --background: var(--ion-background-color);
}

.page-header ion-toolbar {
  --background: var(--app-panel);
  --color: var(--ion-text-color);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.toolbar-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.brand-box {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: linear-gradient(135deg, #c26b2d, #e58b43);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.brand-box h1 {
  margin: 0;
  font-size: 18px;
}

.brand-box p {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--app-muted);
}

.theme-btn {
  --color: var(--ion-text-color);
}

.page-shell {
  padding: 16px;
}

.panel {
  background: var(--app-panel);
  border-radius: 22px;
  box-shadow: var(--app-soft-shadow);
  padding: 18px;
}

/* Filter Section */
.filter-section {
  margin-bottom: 20px;
  padding: 16px;
  background: var(--app-panel-2);
  border-radius: 16px;
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--ion-text-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.report-type-tabs {
  display: flex;
  gap: 8px;
}

.tab-btn {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid var(--ion-border-color);
  background: var(--app-panel);
  color: var(--app-muted);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: linear-gradient(135deg, #c26b2d, #e58b43);
  color: #fff;
  border-color: transparent;
}

.date-filter,
.date-range-filter {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.date-box {
  --background: var(--app-input-bg);
  border-radius: 12px;
  --padding-start: 12px;
  --padding-end: 12px;
}

.notes-input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--ion-border-color);
  border-radius: 12px;
  background: var(--app-input-bg);
  color: var(--ion-text-color);
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
}

.notes-input::placeholder {
  color: var(--app-muted);
}

/* Report Print Area */
.report-print-area {
  background: var(--app-panel);
  padding: 24px;
  border-radius: 16px;
  margin: 20px 0;
}

.report-header {
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--ion-border-color);
}

.report-header h2 {
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--ion-text-color);
}

.report-meta {
  display: flex;
  justify-content: center;
  gap: 32px;
  font-size: 13px;
}

.report-meta div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.report-meta strong {
  color: var(--ion-text-color);
  font-weight: 600;
}

.report-meta span {
  color: var(--app-muted);
}

/* Report Sections */
.report-section {
  margin-bottom: 24px;
}

.section-header {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--ion-text-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--ion-border-color);
}

/* Summary Grid */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (min-width: 768px) {
  .summary-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.summary-item {
  padding: 12px;
  background: var(--app-panel-2);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-item span {
  font-size: 12px;
  color: var(--app-muted);
  font-weight: 500;
}

.summary-item strong {
  font-size: 16px;
  color: var(--ion-text-color);
  font-weight: 700;
}

.summary-item.highlight {
  background: linear-gradient(135deg, rgba(194, 107, 45, 0.15), rgba(229, 139, 67, 0.15));
  border: 1px solid rgba(194, 107, 45, 0.3);
}

.summary-item.highlight strong {
  color: #c26b2d;
}

/* Table Styles */
.payment-detail-table,
.product-detail-table {
  border: 1px solid var(--ion-border-color);
  border-radius: 12px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 0.8fr 1.2fr 0.8fr;
  background: var(--app-panel-2);
  padding: 14px;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--ion-text-color);
}

.product-detail-table .table-header {
  grid-template-columns: 0.5fr 1fr 0.8fr 1.2fr;
}

.col-method,
.col-product,
.col-rank {
  text-align: left;
}

.col-count,
.col-qty,
.col-amount {
  text-align: right;
}

.col-percent {
  text-align: right;
}

.table-rows {
  max-height: 400px;
  overflow-y: auto;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 0.8fr 1.2fr 0.8fr;
  padding: 12px 14px;
  border-bottom: 1px solid var(--ion-border-color);
  font-size: 14px;
  align-items: center;
}

.product-detail-table .table-row {
  grid-template-columns: 0.5fr 1fr 0.8fr 1.2fr;
}

.table-row:last-child {
  border-bottom: none;
}

.col-count,
.col-qty,
.col-amount {
  text-align: right;
}

.col-percent {
  text-align: right;
}

.table-footer {
  display: grid;
  grid-template-columns: 1fr 0.8fr 1.2fr 0.8fr;
  padding: 12px 14px;
  background: var(--app-panel-2);
  font-weight: 600;
  font-size: 14px;
  border-top: 2px solid var(--ion-border-color);
}

.product-detail-table .table-footer {
  grid-template-columns: 0.5fr 1fr 0.8fr 1.2fr;
}

/* Notes Area */
.notes-area {
  padding: 12px;
  background: var(--app-panel-2);
  border-radius: 8px;
  min-height: 60px;
  border: 1px dashed var(--ion-border-color);
}

.notes-area p {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--ion-text-color);
  white-space: pre-wrap;
  word-break: break-word;
}

/* Signature Section */
.signature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
  margin-top: 16px;
}

.signature-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: center;
}

.signature-line {
  flex: 1;
  min-height: 60px;
  border-bottom: 2px solid var(--ion-border-color);
}

.signature-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--ion-text-color);
}

.signature-date {
  font-size: 12px;
  color: var(--app-muted);
}

/* Action Buttons */
.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 20px;
}

.export-btn {
  --background: linear-gradient(135deg, #c26b2d, #e58b43);
  --border-radius: 12px;
  height: 48px;
  font-weight: 600;
}

.refresh-btn {
  --border-color: var(--ion-border-color);
  --color: var(--ion-text-color);
  --border-radius: 12px;
  height: 48px;
  font-weight: 600;
}

/* Profit/Loss Form Styles */
.profitloss-form {
  background: var(--app-panel-2);
  border-radius: 12px;
  padding: 16px;
}

.form-section {
  margin-bottom: 20px;
}

.form-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--ion-text-color);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 12px;
  font-weight: 500;
  color: var(--app-muted);
  margin-bottom: 6px;
}

.form-group ion-input {
  background: var(--app-panel);
  border-radius: 8px;
  padding: 8px 12px;
  border: 1px solid var(--ion-border-color);
}

.calculation-results {
  background: linear-gradient(135deg, rgba(194, 107, 45, 0.1), rgba(229, 139, 67, 0.1));
  border-left: 4px solid #c26b2d;
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--app-panel);
  border-radius: 8px;
  border: 1px solid var(--ion-border-color);
}

.result-item.highlight {
  background: linear-gradient(135deg, rgba(100, 200, 100, 0.2), rgba(150, 250, 150, 0.2));
  border-color: #64c864;
}

.result-item.profit {
  background: linear-gradient(135deg, rgba(100, 200, 100, 0.2), rgba(150, 250, 150, 0.2));
  border-color: #64c864;
  color: #28a745;
}

.result-item.loss {
  background: linear-gradient(135deg, rgba(220, 50, 50, 0.2), rgba(255, 100, 100, 0.2));
  border-color: #dc3232;
  color: #dc3232;
}

.result-item .label {
  font-size: 13px;
  font-weight: 500;
  color: var(--app-muted);
}

.result-item .value {
  font-size: 15px;
  font-weight: 700;
  color: var(--ion-text-color);
  text-align: right;
}

/* Transaction Detail Table */
.transaction-detail-table {
  border: 1px solid var(--ion-border-color);
  border-radius: 12px;
  overflow: hidden;
}

.transaction-header {
  grid-template-columns: 0.4fr 0.8fr 1.2fr 0.5fr 0.9fr 0.7fr 0.7fr 0.9fr 0.7fr;
  font-size: 11px;
}

.transaction-row {
  grid-template-columns: 0.4fr 0.8fr 1.2fr 0.5fr 0.9fr 0.7fr 0.7fr 0.9fr 0.7fr;
  font-size: 13px;
}

.transaction-footer {
  grid-template-columns: 0.4fr 0.8fr 1.2fr 0.5fr 0.9fr 0.7fr 0.7fr 0.9fr 0.7fr;
  font-size: 13px;
}

.col-no,
.col-time,
.col-customer,
.col-items,
.col-subtotal,
.col-discount,
.col-tax,
.col-total,
.col-method {
  text-align: right;
}

.col-customer,
.col-time,
.col-no {
  text-align: left;
}

.col-subtotal,
.col-discount,
.col-tax,
.col-total {
  text-align: right;
  font-family: 'Courier New', monospace;
}

.payment-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.badge-cash {
  background: rgba(76, 175, 80, 0.15);
  color: #4caf50;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.badge-qris {
  background: rgba(33, 150, 243, 0.15);
  color: #2196f3;
  border: 1px solid rgba(33, 150, 243, 0.3);
}

.badge-transfer {
  background: rgba(156, 39, 176, 0.15);
  color: #9c27b0;
  border: 1px solid rgba(156, 39, 176, 0.3);
}

.empty-message {
  text-align: center;
  padding: 40px 20px;
  color: var(--app-muted);
  font-size: 14px;
}

.empty-message p {
  margin: 0;
  font-size: 16px;
}

/* Print Styles */
@media print {
  .filter-section,
  .action-buttons {
    display: none;
  }

  .report-print-area {
    margin: 0;
    padding: 0;
    box-shadow: none;
  }
}

@media (max-width: 991px) {
  .toolbar-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .report-meta {
    flex-direction: column;
    gap: 8px;
    justify-content: flex-start;
  }

  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .signature-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .action-buttons {
    grid-template-columns: 1fr;
  }

  .table-header,
  .table-row,
  .table-footer {
    font-size: 12px;
  }

  .transaction-header,
  .transaction-row,
  .transaction-footer {
    grid-template-columns: 0.3fr 0.6fr 1fr 0.4fr 0.7fr 0.6fr 0.6fr 0.8fr 0.6fr !important;
    font-size: 11px;
  }
}

@media (max-width: 768px) {
  .transaction-header,
  .transaction-row,
  .transaction-footer {
    grid-template-columns: 0.3fr 0.5fr 0.8fr 0.4fr 0.6fr 0.5fr 0.5fr 0.7fr 0.5fr !important;
    font-size: 10px;
    padding: 8px 10px !important;
  }

  .col-subtotal,
  .col-discount,
  .col-tax,
  .col-total {
    font-size: 11px;
  }

  .payment-badge {
    font-size: 9px;
    padding: 3px 6px;
  }
}
</style>