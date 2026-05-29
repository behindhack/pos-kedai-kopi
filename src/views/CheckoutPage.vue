<template>
  <ion-page>
    <ion-header class="checkout-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/kasir" />
        </ion-buttons>
        <ion-title>Checkout</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="checkout-content">
      <ion-grid fixed>
        <ion-row>
          <ion-col size="12" size-lg="8">
            <!-- Order Summary -->
            <ion-card class="order-summary-card">
              <ion-card-header>
                <ion-card-title>Ringkasan Pesanan</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <div v-if="sales.currentCart.length > 0" class="items-list">
                  <div v-for="(item, i) in sales.currentCart" :key="i" class="item-row">
                    <div class="item-info">
                      <h3>{{ item.product.name }}</h3>
                      <p class="item-details">{{ item.qty }} x {{ formatCurrency(item.product.basePrice) }}</p>
                      <p v-if="item.selectedVariantIds.length > 0" class="item-variants">
                        Varian: {{ getVariantNames(item).join(', ') }}
                      </p>
                    </div>
                    <div class="item-price">
                      {{ formatCurrency(calculateItemPrice(item)) }}
                    </div>
                  </div>
                </div>
                <div v-else class="empty-cart-message">
                  <p>Keranjang Anda kosong</p>
                  <ion-button fill="clear" href="/tabs/kasir">
                    Kembali ke Menu
                  </ion-button>
                </div>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="12" size-lg="4">
            <!-- Payment Details -->
            <ion-card class="payment-card">
              <ion-card-header>
                <ion-card-title>Detail Pembayaran</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <!-- Subtotal -->
                <div class="payment-row">
                  <span>Subtotal</span>
                  <span class="price">{{ formatCurrency(sales.subtotal) }}</span>
                </div>

                <!-- Discount Type Segment -->
                <div class="payment-row">
                  <span>Tipe Diskon</span>
                  <ion-segment v-model="discountType" mode="ios" style="width: 150px; min-height: 32px;">
                    <ion-segment-button value="nominal" style="min-height: 32px; font-size: 12px;">
                      <ion-label>Rp</ion-label>
                    </ion-segment-button>
                    <ion-segment-button value="percent" style="min-height: 32px; font-size: 12px;">
                      <ion-label>%</ion-label>
                    </ion-segment-button>
                  </ion-segment>
                </div>

                <!-- Discount Value -->
                <div class="payment-row">
                  <span>Nilai Diskon</span>
                  <div class="discount-input">
                    <ion-input
                      v-model.number="discountValue"
                      type="number"
                      min="0"
                      :max="discountType === 'percent' ? 100 : sales.subtotal"
                      @ionInput="updateDiscount"
                      :placeholder="discountType === 'percent' ? '0%' : '0'"
                    />
                  </div>
                </div>

                <!-- Tax -->
                <div class="payment-row">
                  <span>Pajak (%)</span>
                  <div class="tax-input">
                    <ion-input
                      v-model.number="taxPercent"
                      type="number"
                      min="0"
                      max="100"
                      @blur="updateTax"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div class="ion-margin-y divider"></div>

                <!-- Total -->
                <div class="payment-row total-row">
                  <span><strong>Total</strong></span>
                  <span class="price total-price">{{ formatCurrency(sales.total) }}</span>
                </div>
              </ion-card-content>
            </ion-card>

            <!-- Payment Method -->
            <ion-card class="payment-method-card">
              <ion-card-header>
                <ion-card-title>Metode Pembayaran</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-segment v-model="selectedPaymentMethod" class="payment-segment">
                  <ion-segment-button value="CASH">
                    <ion-label>Tunai</ion-label>
                  </ion-segment-button>
                  <ion-segment-button value="QRIS">
                    <ion-label>QRIS</ion-label>
                  </ion-segment-button>
                  <ion-segment-button value="TRANSFER">
                    <ion-label>Transfer</ion-label>
                  </ion-segment-button>
                </ion-segment>

                <!-- Cash Payment -->
                <div v-if="selectedPaymentMethod === 'CASH'" class="cash-payment">
                  <ion-item>
                    <ion-input
                      v-model.number="amountPaid"
                      type="number"
                      label="Jumlah Dibayar"
                      label-placement="stacked"
                      min="0"
                      @blur="calculateChange"
                      placeholder="0"
                    />
                  </ion-item>

                  <div class="change-display">
                    <div class="change-row">
                      <span>Kembalian</span>
                      <span :class="changeClass">
                        {{ formatCurrency(calculateChange()) }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- QRIS/Transfer Info -->
                <div v-else class="payment-info">
                  <ion-note>
                    <p v-if="selectedPaymentMethod === 'QRIS'">
                      Tunjukkan kode QRIS Anda untuk pembayaran
                    </p>
                    <p v-else>
                      Total transfer: <strong>{{ formatCurrency(sales.total) }}</strong>
                    </p>
                  </ion-note>
                </div>
              </ion-card-content>
            </ion-card>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <ion-button expand="block" fill="outline" href="/tabs/kasir">
                Batal
              </ion-button>
              <ion-button
                expand="block"
                color="primary"
                @click="processPayment"
                :disabled="isProcessing || !canProcessPayment"
              >
                <ion-spinner name="crescent" v-if="isProcessing" slot="start"></ion-spinner>
                {{ isProcessing ? 'Memproses...' : 'Proses Pembayaran' }}
              </ion-button>
            </div>
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- Success Modal -->
      <ion-modal :is-open="showSuccessModal" @didDismiss="closeSuccessModal">
        <ion-header>
          <ion-toolbar>
            <ion-title>Transaksi Berhasil</ion-title>
          </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding ion-text-center" v-if="lastSale">
          <div class="success-icon"><ion-icon :icon="checkmarkCircleOutline" color="success"></ion-icon></div>
          <h2>Pembayaran Diterima</h2>

          <div class="receipt-summary">
            <div class="summary-item">
              <span>Total</span>
              <strong>{{ formatCurrency(lastSale.total) }}</strong>
            </div>
            <div class="summary-item">
              <span>Metode</span>
              <strong>{{ lastSale.payment.method }}</strong>
            </div>
            <div v-if="lastSale.payment?.change > 0" class="summary-item">
              <span>Kembalian</span>
              <strong>{{ formatCurrency(lastSale.payment.change) }}</strong>
            </div>
          </div>

          <div class="ion-margin-y divider"></div>

          <ion-button expand="block" @click="handlePrintReceipt" class="print-button">
            <ion-icon slot="start" :icon="printOutline"></ion-icon>
            Cetak Struk
          </ion-button>

          <ion-button
            expand="block"
            fill="clear"
            @click="finishTransaction"
            color="primary"
          >
            Selesai
          </ion-button>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonInput,
  IonItem,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonButtons,
  IonBackButton,
  IonModal,
  IonSpinner,
  IonIcon,
  IonNote,
  toastController,
} from '@ionic/vue';
import { printOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSalesStore } from '../stores/sales';
import { useShopStore } from '../stores/shop';
import { printReceipt } from '../utils/print';
import { formatCurrency } from '../utils/formatters';
import { validatePayment } from '../utils/validators';
import type { PaymentMethod, Sale } from '../types';

const router = useRouter();
const sales = useSalesStore();
const shopStore = useShopStore();

const selectedPaymentMethod = ref<PaymentMethod>('CASH');
const amountPaid = ref(0);
const taxPercent = ref(shopStore.settings?.taxPercent || 0);

const discountType = ref<'nominal' | 'percent'>('nominal');
const discountValue = ref(0);
const discountAmount = computed(() => {
  if (discountType.value === 'percent') {
    return (sales.subtotal * (discountValue.value || 0)) / 100;
  }
  return discountValue.value || 0;
});
const isProcessing = ref(false);
const showSuccessModal = ref(false);
const lastSale = ref<Sale | null>(null);

onMounted(() => {
  sales.loadFromStorage();
  shopStore.loadFromStorage();

  // Redirect if cart is empty
  if (sales.currentCart.length === 0) {
    router.push('/tabs/kasir');
  }

  // Set default amount paid to total
  amountPaid.value = Math.ceil(sales.total / 1000) * 1000; // Round up to nearest 1000
});

const calculateItemPrice = (item: any) => {
  const variantExtra = item.selectedVariantIds.reduce((acc: number, variantId: string) => {
    const variant = item.product.variants?.find((v: any) => v.id === variantId);
    return acc + (variant?.extraPrice || 0);
  }, 0);
  return (item.product.basePrice + variantExtra) * item.qty;
};

const getVariantNames = (item: any) => {
  return item.selectedVariantIds
    .map((variantId: string) => {
      const variant = item.product.variants?.find((v: any) => v.id === variantId);
      return variant?.name || '';
    })
    .filter((name: string) => name);
};

const calculateChange = () => {
  if (selectedPaymentMethod.value !== 'CASH') {
    return 0;
  }
  return Math.max(amountPaid.value - sales.total, 0);
};

const changeClass = computed(() => {
  const change = calculateChange();
  return {
    'text-danger': amountPaid.value < sales.total,
    'text-success': change > 0,
  };
});

const canProcessPayment = computed(() => {
  if (selectedPaymentMethod.value === 'CASH') {
    return amountPaid.value >= sales.total;
  }
  return true;
});

const updateDiscount = () => {
  if (discountType.value === 'percent' && discountValue.value > 100) {
    discountValue.value = 100;
  } else if (discountType.value === 'nominal' && discountValue.value > sales.subtotal) {
    discountValue.value = sales.subtotal;
  }
  sales.setDiscount(discountAmount.value || 0);
};

const updateTax = () => {
  sales.taxPercent = taxPercent.value || 0;
};

const processPayment = async () => {
  const errors = validatePayment(sales.total, amountPaid.value, selectedPaymentMethod.value);
  
  if (errors.length > 0) {
    const toast = await toastController.create({
      message: errors[0].message,
      duration: 2000,
      position: 'top',
      color: 'danger',
    });
    await toast.present();
    return;
  }

  isProcessing.value = true;

  try {
    const result = await sales.finalizeSale(selectedPaymentMethod.value, amountPaid.value);

    if (result.success && result.sale) {
      lastSale.value = result.sale;
      showSuccessModal.value = true;
    } else {
      const toast = await toastController.create({
        message: result.error || 'Transaksi gagal',
        duration: 2000,
        position: 'top',
        color: 'danger',
      });
      await toast.present();
    }
  } catch (error: any) {
    console.error('Process Payment Error:', error);
    const toast = await toastController.create({
      message: (error.stack || error.message) + ' (Tolong screenshot ini)',
      duration: 2000,
      position: 'top',
      color: 'danger',
    });
    await toast.present();
  } finally {
    isProcessing.value = false;
  }
};

const closeSuccessModal = () => {
  showSuccessModal.value = false;
};

const finishTransaction = () => {
  closeSuccessModal();
  router.push('/tabs/kasir');
};

const handlePrintReceipt = () => {
  if (lastSale.value) {
    printReceipt(lastSale.value, shopStore.settings);
  }
};
</script>

<style scoped>
.checkout-header ion-toolbar {
  --background: var(--app-panel);
  --color: var(--ion-text-color);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.checkout-content {
  --background: var(--ion-background-color);
}

.divider {
  height: 1px;
  background: var(--app-border);
}

.order-summary-card,
.payment-card,
.payment-method-card {
  background: var(--app-panel);
  margin-bottom: 16px;
  box-shadow: var(--app-soft-shadow);
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px;
  background: var(--ion-background-color);
  border-radius: 12px;
}

.item-info h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.item-details {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--app-muted);
}

.item-variants {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--app-muted);
  font-style: italic;
}

.item-price {
  font-size: 16px;
  font-weight: 700;
  color: var(--app-primary);
}

.empty-cart-message {
  text-align: center;
  padding: 32px 16px;
  color: var(--app-muted);
}

.payment-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  font-size: 16px;
}

.payment-row .price {
  font-weight: 600;
}

.discount-input,
.tax-input {
  width: 100px;
  display: flex;
  align-items: center;
}

.discount-input ion-input,
.tax-input ion-input {
  --padding-start: 12px;
  --padding-end: 12px;
  --background: var(--app-input-bg);
  border: 1.5px solid var(--ion-border-color);
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.discount-input ion-input:hover,
.tax-input ion-input:hover {
  box-shadow: var(--app-shadow-sm);
}

.discount-input ion-input:focus,
.tax-input ion-input:focus {
  --border-color: var(--ion-color-primary);
  border: 1.5px solid var(--ion-color-primary);
  box-shadow: 0 0 0 3px var(--app-info-bg);
}

.payment-row.total-row {
  font-size: 18px;
  padding-top: 16px;
  border-top: 1px solid var(--app-border);
  margin-top: 8px;
}

.total-price {
  color: var(--app-primary);
  font-size: 20px;
}

.payment-segment {
  width: 100%;
  margin-bottom: 16px;
}

.cash-payment {
  margin-top: 12px;
}

.cash-payment ion-item {
  margin-bottom: 12px;
}

.change-display {
  background: var(--ion-background-color);
  border-radius: 12px;
  padding: 16px;
  margin-top: 12px;
}

.change-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}

.change-row .text-danger {
  color: var(--app-danger);
}

.change-row .text-success {
  color: var(--app-success);
}

.payment-info {
  text-align: center;
  padding: 16px;
  background: var(--ion-background-color);
  border-radius: 12px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.action-buttons ion-button {
  flex: 1;
}

.success-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.receipt-summary {
  background: var(--app-panel);
  border-radius: 12px;
  padding: 16px;
  margin: 16px 0;
  text-align: left;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--app-border);
}

.summary-item:last-child {
  border-bottom: none;
}

.print-button {
  margin-top: 16px;
}

/* Responsive Design */
@media (max-width: 991px) {
  .checkout-content :deep(.ion-grid) {
    padding: 12px;
  }

  .order-summary-card,
  .payment-card,
  .payment-method-card {
    margin-bottom: 14px;
  }
}

@media (max-width: 768px) {
  .checkout-content :deep(.ion-grid) {
    padding: 8px;
    --ion-grid-padding: 8px;
  }

  .order-summary-card,
  .payment-card,
  .payment-method-card {
    margin-bottom: 12px;
  }

  .item-row {
    padding: 10px;
    font-size: 14px;
  }

  .item-info h3 {
    font-size: 14px;
  }

  .item-details,
  .item-variants {
    font-size: 12px;
  }

  .item-price {
    font-size: 14px;
  }

  .payment-row {
    font-size: 14px;
    padding: 10px 0;
  }

  .discount-input,
  .tax-input {
    width: 80px;
    font-size: 14px;
  }

  .payment-row.total-row {
    font-size: 16px;
  }

  .total-price {
    font-size: 18px;
  }

  .change-row {
    font-size: 14px;
  }

  .action-buttons {
    gap: 8px;
    margin-top: 16px;
  }

  .success-icon {
    font-size: 40px;
    margin-bottom: 12px;
  }

  .receipt-summary {
    padding: 12px;
    margin: 12px 0;
  }

  .summary-item {
    padding: 6px 0;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .checkout-content :deep(.ion-grid) {
    padding: 4px;
  }

  .checkout-header ion-toolbar {
    padding: 0 8px;
  }

  .order-summary-card,
  .payment-card,
  .payment-method-card {
    margin-bottom: 10px;
    box-shadow: none;
    border: 1px solid var(--app-border);
  }

  .order-summary-card ion-card-header,
  .payment-card ion-card-header,
  .payment-method-card ion-card-header {
    padding: 12px;
  }

  .order-summary-card ion-card-content,
  .payment-card ion-card-content,
  .payment-method-card ion-card-content {
    padding: 12px;
  }

  .item-row {
    padding: 8px;
    gap: 8px;
    flex-wrap: wrap;
  }

  .item-info {
    flex: 1;
    min-width: 0;
  }

  .item-info h3 {
    font-size: 13px;
    margin: 0;
  }

  .item-details,
  .item-variants {
    font-size: 11px;
    margin: 2px 0 0 0;
  }

  .item-price {
    font-size: 13px;
    font-weight: 700;
    flex-basis: 100%;
    text-align: right;
    margin-top: 4px;
  }

  .payment-row {
    font-size: 13px;
    padding: 8px 0;
    flex-wrap: wrap;
    gap: 4px;
  }

  .discount-input,
  .tax-input {
    width: 70px;
    font-size: 13px;
  }

  .discount-input ion-input,
  .tax-input ion-input {
    padding: 4px 8px;
  }

  .payment-row.total-row {
    font-size: 14px;
    margin-top: 6px;
    padding-top: 10px;
  }

  .total-price {
    font-size: 16px;
  }

  .change-display {
    padding: 12px;
    margin-top: 10px;
  }

  .change-row {
    font-size: 13px;
  }

  .payment-info {
    padding: 12px;
    font-size: 13px;
  }

  .payment-segment {
    margin-bottom: 12px;
  }

  .action-buttons {
    gap: 8px;
    margin-top: 12px;
    flex-direction: column;
  }

  .action-buttons ion-button {
    height: 44px;
    font-size: 14px;
  }

  .empty-cart-message {
    padding: 24px 12px;
  }

  .success-icon {
    font-size: 36px;
    margin-bottom: 10px;
  }

  .receipt-summary {
    padding: 10px;
    margin: 10px 0;
  }

  .summary-item {
    padding: 6px 0;
    font-size: 13px;
  }

  .print-button {
    margin-top: 12px;
    height: 44px;
  }
}

@media (max-width: 360px) {
  .item-info h3 {
    font-size: 12px;
  }

  .payment-row {
    font-size: 12px;
  }

  .total-price {
    font-size: 15px;
  }

  .action-buttons ion-button {
    font-size: 13px;
  }
}
</style>
