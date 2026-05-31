<template>
  <ion-page>
    <ion-header class="kasir-header">
      <ion-toolbar>
        <div class="toolbar-inner">
          <div class="brand-box">
            <div class="brand-logo">☕</div>
            <div>
              <h1>Kedai Kopi POS</h1>
              <p>Smart cashier for coffee shop</p>
            </div>
          </div>

          <div class="toolbar-actions">
            <!-- Unpaid Orders Shortcut -->
            <ion-button fill="clear" color="danger" class="unpaid-btn" v-if="unpaidCount > 0" @click="openUnpaidModal" title="Ada tagihan belum lunas">
              <ion-icon :icon="walletOutline" slot="start"></ion-icon>
              {{ unpaidCount }} Belum Lunas
            </ion-button>

            <ion-button fill="clear" class="theme-btn" @click="toggleTheme" aria-label="Toggle dark mode">
              <ion-icon :icon="isDark ? sunnyOutline : moonOutline" slot="icon-only"></ion-icon>
            </ion-button>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="kasir-content">
      <ion-grid fixed>
        <ion-row class="layout-row">
          <ion-col size="12" size-lg="8">
            <div class="menu-panel">
              <div class="top-tools">
                <ion-segment v-model="orderType" class="order-type">
                  <ion-segment-button value="DINE_IN">
                    <ion-label>Dine-in</ion-label>
                  </ion-segment-button>
                  <ion-segment-button value="TAKE_AWAY">
                    <ion-label>Take-away</ion-label>
                  </ion-segment-button>
                </ion-segment>

                <ion-item lines="none" class="customer-input">
                  <ion-input
                    v-model="customerName"
                    label="Nama Pelanggan"
                    label-placement="stacked"
                    placeholder="Opsional"
                  />
                </ion-item>
              </div>

              <ion-segment v-model="selectedCategory" class="category-segment">
                <ion-segment-button value="ALL"><ion-label>Semua</ion-label></ion-segment-button>
                <ion-segment-button value="ESPRESSO"><ion-label>Espresso</ion-label></ion-segment-button>
                <ion-segment-button value="MANUAL_BREW"><ion-label>Manual Brew</ion-label></ion-segment-button>
                <ion-segment-button value="NON_COFFEE"><ion-label>Non Coffee</ion-label></ion-segment-button>
                <ion-segment-button value="FOOD"><ion-label>Food</ion-label></ion-segment-button>
              </ion-segment>

              <ion-searchbar
                v-model="search"
                placeholder="Cari menu..."
                class="search-bar"
              />

              <ion-grid class="product-grid">
                <ion-row>
                  <ion-col
                    size="6"
                    size-md="4"
                    size-xl="3"
                    v-for="p in filteredProducts"
                    :key="p.id"
                  >
                    <ion-card class="menu-card">
                      <div class="card-clickable" @click="addToCart(p)">
                        <div class="badge-qty" v-if="getCartQty(p.id) > 0">
                          {{ getCartQty(p.id) }}
                        </div>

                        <div class="menu-image-wrap">
                          <img v-if="p.image" :src="p.image" alt="Menu" class="menu-image" />
                          <div v-else class="menu-placeholder">☕</div>
                        </div>

                        <ion-card-header>
                          <ion-card-title class="menu-title">{{ p.name }}</ion-card-title>
                        </ion-card-header>

                        <ion-card-content>
                          <p class="menu-category">{{ formatCategory(p.category) }}</p>
                          <p class="menu-price">{{ formatCurrency(p.basePrice) }}</p>
                        </ion-card-content>
                      </div>
                    </ion-card>
                  </ion-col>
                </ion-row>
              </ion-grid>
            </div>
          </ion-col>

          <ion-col size="12" size-lg="4">
            <div class="cart-panel">
              <div class="cart-header">
                <h2>Keranjang</h2>
                <p>{{ sales.currentCart.length }} item</p>
              </div>

              <div class="cart-items" v-if="sales.currentCart.length">
                <div class="cart-item" v-for="(item, i) in sales.currentCart" :key="i">
                  <div class="cart-item-left">
                    <div class="cart-thumb">
                      <img v-if="item.product.image" :src="item.product.image" alt="Produk" />
                      <span v-else>☕</span>
                    </div>
                    <div>
                      <h3>{{ item.product.name }}</h3>
                      <p v-if="item.selectedVariantIds.length > 0" style="font-size: 11px; color: var(--app-muted); margin-bottom: 4px;">
                        {{ item.product.variants?.find(v => v.id === item.selectedVariantIds[0])?.name }}
                      </p>
                      <p>{{ formatCurrency(item.product.basePrice + (item.product.variants?.find(v => v.id === item.selectedVariantIds[0])?.extraPrice || 0)) }}</p>
                    </div>
                  </div>

                  <div class="cart-item-right">
                    <ion-button size="small" fill="clear" @click="decQty(i)">-</ion-button>
                    <span>{{ item.qty }}</span>
                    <ion-button size="small" fill="clear" @click="incQty(i)">+</ion-button>
                  </div>
                </div>
              </div>

              <div v-else class="empty-cart">
                <div class="empty-icon">🛒</div>
                <p>Belum ada item di keranjang</p>
              </div>

              <div class="cart-summary">
                <div class="summary-row">
                  <span>Subtotal</span>
                  <span>{{ formatCurrency(sales.subtotal) }}</span>
                </div>
                <div class="summary-row">
                  <span>Diskon</span>
                  <span>- {{ formatCurrency(sales.discountAmount) }}</span>
                </div>
                <div class="summary-row">
                  <span>Pajak</span>
                  <span>{{ formatCurrency(sales.taxAmount) }}</span>
                </div>
                <div class="summary-row total">
                  <span>Total</span>
                  <span>{{ formatCurrency(sales.total) }}</span>
                </div>
              </div>

              <div class="cart-actions">
                <template v-if="sales.currentCart.length">
                  <ion-button
                    expand="block"
                    color="warning"
                    class="checkout-btn ion-margin-bottom"
                    @click="processPayLater"
                    :disabled="isProcessing"
                  >
                    <ion-spinner name="crescent" v-if="isProcessing" slot="start"></ion-spinner>
                    Bayar Nanti (Open Bill)
                  </ion-button>
                  <ion-button
                    expand="block"
                    color="primary"
                    class="checkout-btn"
                    @click="openPayment"
                    :disabled="isProcessing"
                  >
                    Bayar Sekarang
                  </ion-button>
                </template>
                
                <ion-button
                  v-if="unpaidCount > 0"
                  expand="block"
                  color="danger"
                  class="checkout-btn"
                  :class="{ 'ion-margin-top': sales.currentCart.length > 0 }"
                  @click="openUnpaidModal"
                >
                  <ion-icon :icon="walletOutline" slot="start"></ion-icon>
                  {{ unpaidCount }} Tagihan Belum Lunas
                </ion-button>
              </div>
            </div>
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- Variant Selection Modal -->
      <ion-modal :is-open="showVariantModal" @didDismiss="closeVariantModal" class="variant-modal">
        <ion-header>
          <ion-toolbar>
            <ion-title>Pilih Varian</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeVariantModal">Tutup</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding" v-if="selectedProductForVariant">
          <h3 class="ion-margin-bottom">{{ selectedProductForVariant.name }}</h3>
          
          <ion-list>
            <ion-radio-group v-model="selectedVariantId">
              <ion-item v-for="variant in selectedProductForVariant.variants" :key="variant.id">
                <ion-label>
                  {{ variant.name }}
                  <span v-if="variant.extraPrice > 0" class="ion-margin-start" style="color: var(--ion-color-primary)">
                    (+{{ formatCurrency(variant.extraPrice) }})
                  </span>
                </ion-label>
                <ion-radio slot="end" :value="variant.id"></ion-radio>
              </ion-item>
            </ion-radio-group>
          </ion-list>

          <ion-button expand="block" class="ion-margin-top" @click="confirmVariantSelection" :disabled="!selectedVariantId">
            Tambahkan ke Keranjang
          </ion-button>
        </ion-content>
      </ion-modal>

      <ion-modal :is-open="showPayment" @didDismiss="closePayment">
        <ion-header>
          <ion-toolbar>
            <ion-title>Pembayaran</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closePayment">Tutup</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
          <ion-item>
            <ion-label>Total</ion-label>
            <ion-note slot="end">{{ formatCurrency(sales.total) }}</ion-note>
          </ion-item>

          <ion-item>
            <ion-select
              v-model="paymentMethod"
              label="Metode Pembayaran"
              label-placement="stacked"
            >
              <ion-select-option value="CASH">Tunai</ion-select-option>
              <ion-select-option value="QRIS">QRIS</ion-select-option>
              <ion-select-option value="TRANSFER">Transfer</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item v-if="paymentMethod === 'CASH'">
            <ion-input
              v-model.number="paidAmount"
              type="number"
              label="Jumlah Dibayar"
              label-placement="stacked"
            />
          </ion-item>

          <ion-item v-if="paymentMethod === 'CASH'">
            <ion-label>Kembalian</ion-label>
            <ion-note slot="end">
              {{ formatCurrency(Math.max(paidAmount - sales.total, 0)) }}
            </ion-note>
          </ion-item>

          <ion-button expand="block" class="ion-margin-top" @click="confirmPayment">
            Selesaikan Transaksi
          </ion-button>
        </ion-content>
      </ion-modal>

      <!-- Receipt Modal -->
      <ion-modal :is-open="showReceipt" @didDismiss="closeReceipt">
        <ion-header>
          <ion-toolbar>
            <ion-title>Struk Pembayaran</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeReceipt">Tutup</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding" v-if="lastSale">
          <div class="receipt-preview">
            <div class="receipt-header">
              <div class="receipt-logo" v-if="shopStore.settings.shopLogo">
                <img v-if="shopStore.settings.shopLogo.startsWith('http') || shopStore.settings.shopLogo.startsWith('data:image')" :src="shopStore.settings.shopLogo" alt="Logo" style="max-height: 80px; max-width: 100%;" />
                <span v-else>{{ shopStore.settings.shopLogo }}</span>
              </div>
              <h2>{{ shopStore.settings.shopName }}</h2>
              <p v-if="shopStore.settings.address">{{ shopStore.settings.address }}</p>
              <p v-if="shopStore.settings.phone">{{ shopStore.settings.phone }}</p>
            </div>

            <div class="receipt-content">
              <div class="receipt-section">
                <div class="receipt-row">
                  <span>Tanggal:</span>
                  <span>{{ new Date(lastSale.date).toLocaleString('id-ID') }}</span>
                </div>
                <div class="receipt-row">
                  <span>Tipe Pesanan:</span>
                  <span>{{ lastSale.orderType === 'DINE_IN' ? 'Makan di Tempat' : 'Take Away' }}</span>
                </div>
                <div v-if="lastSale.customerName" class="receipt-row">
                  <span>Pelanggan:</span>
                  <span>{{ lastSale.customerName }}</span>
                </div>
              </div>

              <div class="receipt-section">
                <div class="section-title">ITEM PESANAN</div>
                <div v-for="(item, i) in lastSale.items" :key="i" class="receipt-row">
                  <span>{{ item.product.name }} x{{ item.qty }}</span>
                  <span>{{ formatCurrency((item.product.basePrice) * item.qty) }}</span>
                </div>
              </div>

              <div class="receipt-section">
                <div class="receipt-row">
                  <span>Subtotal:</span>
                  <span>{{ formatCurrency(lastSale.subtotal) }}</span>
                </div>
                <div v-if="lastSale.discount > 0" class="receipt-row">
                  <span>Diskon:</span>
                  <span>- {{ formatCurrency(lastSale.discount) }}</span>
                </div>
                <div v-if="lastSale.tax > 0" class="receipt-row">
                  <span>Pajak:</span>
                  <span>{{ formatCurrency(lastSale.tax) }}</span>
                </div>
                <div class="receipt-row total">
                  <span>TOTAL:</span>
                  <span>{{ formatCurrency(lastSale.total) }}</span>
                </div>
              </div>

              <div class="receipt-section">
                <div class="receipt-row">
                  <span>Metode Pembayaran:</span>
                  <span>{{ lastSale.payment.method }}</span>
                </div>
                <div class="receipt-row">
                  <span>Dibayar:</span>
                  <span>{{ formatCurrency(lastSale.payment.paidAmount) }}</span>
                </div>
                <div v-if="lastSale.payment?.change > 0" class="receipt-row">
                  <span>Kembalian:</span>
                  <span>{{ formatCurrency(lastSale.payment.change) }}</span>
                </div>
              </div>
            </div>
          </div>

          <ion-button expand="block" class="print-btn ion-margin-top" @click="handlePrint">
            <ion-icon slot="start" :icon="printOutline"></ion-icon>
            Cetak Struk
          </ion-button>
          <ion-button expand="block" fill="clear" @click="closeReceipt">
            Selesai
          </ion-button>
        </ion-content>
      </ion-modal>

      <!-- Unpaid Bills List Modal -->
      <ion-modal :is-open="showUnpaidModal" @didDismiss="closeUnpaidModal">
        <ion-header>
          <ion-toolbar>
            <ion-title>Daftar Tagihan (Belum Lunas)</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeUnpaidModal">Tutup</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-list v-if="unpaidOrders.length > 0">
            <ion-item v-for="order in unpaidOrders" :key="order.id" class="ion-margin-bottom" lines="full">
              <ion-label>
                <h2>#{{ String(order.id).slice(-4).toUpperCase() }} - {{ order.customerName || 'Walk-in' }}</h2>
                <p>{{ new Date(order.date).toLocaleString('id-ID') }}</p>
                <p>Status: <strong>{{ order.status }}</strong></p>
                <h3 style="color: var(--ion-color-primary); font-weight: bold;">{{ formatCurrency(order.total) }}</h3>
              </ion-label>
              <ion-button slot="end" color="primary" @click="openSettlePayment(order)">
                Bayar
              </ion-button>
            </ion-item>
          </ion-list>
          <div v-else class="empty-state">
            <div class="empty-icon">✓</div>
            <p>Tidak ada tagihan yang belum lunas.</p>
          </div>
        </ion-content>
      </ion-modal>

      <!-- Settle Unpaid Bill Modal -->
      <ion-modal :is-open="showSettleModal" @didDismiss="closeSettleModal">
        <ion-header>
          <ion-toolbar>
            <ion-title>Pelunasan Tagihan</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeSettleModal">Batal</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding" v-if="orderToSettle">
          <div class="receipt-summary ion-margin-bottom">
            <div class="summary-item">
              <span>Order</span>
              <strong>#{{ String(orderToSettle.id).slice(-4).toUpperCase() }}</strong>
            </div>
            <div class="summary-item">
              <span>Pelanggan</span>
              <strong>{{ orderToSettle.customerName || 'Walk-in' }}</strong>
            </div>
            <div class="summary-item">
              <span>Total Tagihan</span>
              <strong>{{ formatCurrency(orderToSettle.total) }}</strong>
            </div>
          </div>

          <ion-item>
            <ion-select
              v-model="settleMethod"
              label="Metode Pembayaran"
              label-placement="stacked"
            >
              <ion-select-option value="CASH">Tunai</ion-select-option>
              <ion-select-option value="QRIS">QRIS</ion-select-option>
              <ion-select-option value="TRANSFER">Transfer</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item v-if="settleMethod === 'CASH'">
            <ion-input
              v-model.number="settleAmount"
              type="number"
              label="Jumlah Dibayar"
              label-placement="stacked"
              min="0"
            />
          </ion-item>

          <ion-item v-if="settleMethod === 'CASH' && settleAmount >= orderToSettle.total">
            <ion-label>Kembalian</ion-label>
            <ion-note slot="end">
              {{ formatCurrency(settleAmount - orderToSettle.total) }}
            </ion-note>
          </ion-item>

          <ion-button 
            expand="block" 
            class="ion-margin-top" 
            @click="confirmSettlePayment"
            :disabled="isProcessing || (settleMethod === 'CASH' && settleAmount < orderToSettle.total)"
          >
            <ion-spinner name="crescent" v-if="isProcessing" slot="start"></ion-spinner>
            Proses Pelunasan
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
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonItem,
  IonInput,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonSearchbar,
  IonModal,
  IonButtons,
  IonSelect,
  IonSelectOption,
  IonNote,
  IonIcon,
  IonList,
  toastController,
} from '@ionic/vue';
import { sunnyOutline, moonOutline, printOutline, walletOutline } from 'ionicons/icons';
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useProductStore } from '../stores/products';
import { useSalesStore } from '../stores/sales';
import { useShopStore } from '../stores/shop';
import { useTheme } from '../composables/useTheme';
import { printReceipt } from '../utils/print';
import { formatCurrency, formatCategory } from '../utils/formatters';
import type { Product, PaymentMethod, OrderType, Sale } from '../types';

const productStore = useProductStore();
const sales = useSalesStore();
const shopStore = useShopStore();
const { isDark, toggleTheme } = useTheme();
const router = useRouter();

const orderType = ref<OrderType>('DINE_IN');
const customerName = ref('');
const search = ref('');
const selectedCategory = ref<'ALL' | Product['category']>('ALL');

const showPayment = ref(false);
const paymentMethod = ref<PaymentMethod>('CASH');
const paidAmount = ref(0);

const showReceipt = ref(false);
const lastSale = ref<Sale | null>(null);

const showVariantModal = ref(false);
const selectedProductForVariant = ref<Product | null>(null);
const selectedVariantId = ref<string>('');

const unpaidOrders = computed(() => {
  return sales.dailySales.filter(s => s.paymentStatus === 'UNPAID');
});

const unpaidCount = computed(() => unpaidOrders.value.length);

const showUnpaidModal = ref(false);
const showSettleModal = ref(false);
const orderToSettle = ref<Sale | null>(null);
const settleMethod = ref<PaymentMethod>('CASH');
const settleAmount = ref(0);

const isProcessing = ref(false);

onMounted(() => {
  productStore.loadFromStorage();
  sales.loadFromStorage();
  shopStore.loadFromStorage();
});

watch(orderType, (val) => {
  sales.currentOrderType = val;
});

watch(customerName, (val) => {
  sales.currentCustomerName = val;
});

const filteredProducts = computed(() => {
  let products = productStore.products;

  if (selectedCategory.value !== 'ALL') {
    products = products.filter((p) => p.category === selectedCategory.value);
  }

  if (search.value.trim()) {
    products = products.filter((p) =>
      p.name.toLowerCase().includes(search.value.toLowerCase())
    );
  }

  return products;
});

const getCartQty = (productId: string) => {
  return sales.currentCart
    .filter((item) => item.product.id === productId)
    .reduce((sum, item) => sum + item.qty, 0);
};

const addToCart = (product: Product) => {
  if (product.variants && product.variants.length > 0) {
    selectedProductForVariant.value = product;
    // Auto select first variant with no extra price if exists, otherwise first one
    const defaultVar = product.variants.find(v => v.extraPrice === 0) || product.variants[0];
    selectedVariantId.value = defaultVar.id;
    showVariantModal.value = true;
    return;
  }
  
  doAddToCart(product, []);
};

const closeVariantModal = () => {
  showVariantModal.value = false;
  selectedProductForVariant.value = null;
  selectedVariantId.value = '';
};

const confirmVariantSelection = () => {
  if (selectedProductForVariant.value && selectedVariantId.value) {
    doAddToCart(selectedProductForVariant.value, [selectedVariantId.value]);
    closeVariantModal();
  }
};

const doAddToCart = (product: Product, variantIds: string[]) => {
  // Check if exactly same product and variants exist
  const existing = sales.currentCart.find(
    (item) => item.product.id === product.id && 
              JSON.stringify(item.selectedVariantIds) === JSON.stringify(variantIds)
  );
  
  if (existing) {
    existing.qty++;
  } else {
    sales.addToCart({
      product,
      qty: 1,
      selectedVariantIds: variantIds,
    });
  }
};

const incQty = (index: number) => {
  sales.currentCart[index].qty++;
};

const decQty = (index: number) => {
  const item = sales.currentCart[index];
  if (item.qty > 1) item.qty--;
  else sales.currentCart.splice(index, 1);
};

const openPayment = () => {
  router.push('/checkout');
};

const processPayLater = async () => {
  if (isProcessing.value) return;
  isProcessing.value = true;
  
  const toast = await toastController.create({
    duration: 2000,
    position: 'top',
  });

  try {
    // Process open bill
    const result = await sales.finalizeSale('PAY_LATER', 0);
    
    if (result.success && result.sale) {
      toast.message = `Pesanan masuk dapur (Belum Bayar). Tagihan: ${formatCurrency(result.sale.total)}`;
      toast.color = 'success';
      // Cart is cleared automatically by finalizeSale
    } else {
      toast.message = result.error || 'Gagal memproses pesanan';
      toast.color = 'danger';
    }
    await toast.present();
  } catch (error: any) {
    console.error('Pay later error:', error);
    toast.message = 'Terjadi kesalahan sistem';
    toast.color = 'danger';
    await toast.present();
  } finally {
    isProcessing.value = false;
  }
};

const closePayment = () => {
  showPayment.value = false;
};

const confirmPayment = async () => {
  const toast = await toastController.create({
    duration: 2000,
    position: 'top',
  });

  if (paymentMethod.value === 'CASH' && paidAmount.value < sales.total) {
    toast.message = 'Jumlah dibayar kurang dari total';
    await toast.present();
    return;
  }

  const result = await sales.finalizeSale(paymentMethod.value, paidAmount.value);
  
  if (result.success && result.sale) {
    lastSale.value = result.sale;
    showReceipt.value = true;
    closePayment();
    toast.message = `Transaksi selesai. Total ${formatCurrency(result.sale.total)}`;
  } else {
    toast.message = result.error || 'Transaksi gagal';
  }
  
  await toast.present();
};

const closeReceipt = () => {
  showReceipt.value = false;
};

const handlePrint = () => {
  if (lastSale.value) {
    printReceipt(lastSale.value, shopStore.settings);
  }
};

const openUnpaidModal = () => {
  sales.loadSalesReport(); // refresh data
  showUnpaidModal.value = true;
};

const closeUnpaidModal = () => {
  showUnpaidModal.value = false;
};

const openSettlePayment = (order: Sale) => {
  orderToSettle.value = order;
  settleMethod.value = 'CASH';
  settleAmount.value = Math.ceil(order.total / 1000) * 1000;
  showSettleModal.value = true;
};

const closeSettleModal = () => {
  showSettleModal.value = false;
  orderToSettle.value = null;
};

const confirmSettlePayment = async () => {
  if (!orderToSettle.value || isProcessing.value) return;

  isProcessing.value = true;
  const toast = await toastController.create({
    duration: 2000,
    position: 'top',
  });

  try {
    const finalAmount = settleMethod.value === 'CASH' ? settleAmount.value : orderToSettle.value.total;
    
    const result = await sales.payUnpaidSale(
      orderToSettle.value.id, 
      settleMethod.value, 
      finalAmount
    );
    
    if (result.success && result.sale) {
      toast.message = `Pelunasan berhasil untuk #${String(result.sale.id).slice(-4).toUpperCase()}`;
      toast.color = 'success';
      lastSale.value = result.sale;
      
      closeSettleModal();
      
      // If no more unpaid orders, close the list modal too
      if (unpaidCount.value <= 1) {
        closeUnpaidModal();
      }
      
      showReceipt.value = true;
    } else {
      toast.message = result.error || 'Pelunasan gagal';
      toast.color = 'danger';
    }
    await toast.present();
  } catch (error: any) {
    console.error('Settle payment error:', error);
    toast.message = 'Terjadi kesalahan sistem';
    toast.color = 'danger';
    await toast.present();
  } finally {
    isProcessing.value = false;
  }
};
</script>

<style scoped>
.kasir-content {
  --background: var(--ion-background-color);
}

.kasir-header ion-toolbar {
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

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.unpaid-btn {
  font-weight: 700;
  background: var(--app-danger-light, rgba(239, 68, 68, 0.1));
  border-radius: 20px;
  --padding-start: 12px;
  --padding-end: 12px;
}

.theme-btn {
  --color: var(--ion-text-color);
}

.layout-row {
  align-items: stretch;
}

.menu-panel,
.cart-panel {
  background: var(--app-panel);
  border-radius: 22px;
  padding: 18px;
  box-shadow: var(--app-soft-shadow);
}

.cart-panel {
  position: sticky;
  top: 16px;
}

.top-tools {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 16px;
}

.order-type,
.category-segment {
  background: var(--app-panel-2);
  border-radius: 16px;
  padding: 4px;
  --color: var(--ion-text-color);
  --background-checked: var(--ion-color-primary);
  --color-checked: white;
  box-shadow: var(--app-shadow-xs);
}

.customer-input,
.search-bar {
  --background: var(--app-input-bg);
  border-radius: 14px;
  --border-bottom: none;
  border: 1px solid var(--ion-border-color);
}

.product-grid {
  padding: 0;
}

.menu-card {
  margin: 0;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: var(--app-shadow-sm);
  border: 1px solid var(--ion-border-color);
  background: var(--app-panel);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.menu-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--app-shadow-lg);
  border-color: var(--ion-color-primary);
}

.card-clickable {
  cursor: pointer;
  position: relative;
}

.badge-qty {
  position: absolute;
  top: 10px;
  right: 10px;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border-radius: 999px;
  background: #ef4444;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  box-shadow: 0 6px 14px rgba(239, 68, 68, 0.35);
}

.menu-image-wrap {
  height: 110px;
  background: var(--app-input-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.menu-placeholder {
  font-size: 34px;
}

.menu-title {
  font-size: 15px;
  line-height: 1.3;
  color: var(--ion-text-color);
}

.menu-category {
  font-size: 12px;
  color: var(--app-muted);
  margin-bottom: 4px;
}

.menu-price {
  font-size: 15px;
  font-weight: 700;
  color: var(--ion-color-primary);
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.cart-header h2 {
  margin: 0;
  font-size: 22px;
  color: var(--ion-text-color);
}

.cart-header p {
  margin: 0;
  color: var(--app-muted);
  font-size: 13px;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 420px;
  overflow-y: auto;
  padding-right: 4px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  padding: 12px;
  border-radius: 16px;
  background: var(--app-panel-2);
}

.cart-item-left {
  display: flex;
  gap: 10px;
  align-items: center;
}

.cart-thumb {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  overflow: hidden;
  background: var(--app-card-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cart-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-item-left h3 {
  margin: 0;
  font-size: 14px;
  color: var(--ion-text-color);
}

.cart-item-left p {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--app-muted);
}

.cart-item-right {
  display: flex;
  align-items: center;
  gap: 2px;
  font-weight: 600;
  color: var(--ion-text-color);
}

.empty-cart {
  text-align: center;
  padding: 40px 12px;
  color: var(--app-muted);
}

.empty-icon {
  font-size: 42px;
  margin-bottom: 10px;
}

.cart-summary {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px dashed var(--ion-border-color);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  color: var(--ion-text-color);
  font-size: 14px;
}

.summary-row.total {
  font-size: 18px;
  font-weight: 700;
}

.checkout-btn {
  margin-top: 18px;
  --background: linear-gradient(135deg, #c26b2d, #e58b43);
  --border-radius: 16px;
  height: 50px;
  font-weight: 700;
}

.receipt-preview {
  background: var(--app-panel);
  border-radius: 18px;
  padding: 20px;
  border: 1px solid var(--ion-border-color);
  margin-bottom: 20px;
  font-family: 'Courier New', monospace;
}

.receipt-header {
  text-align: center;
  border-bottom: 1px dashed var(--ion-border-color);
  padding-bottom: 14px;
  margin-bottom: 14px;
}

.receipt-logo {
  font-size: 36px;
  margin-bottom: 8px;
}

.receipt-header h2 {
  margin: 8px 0;
  font-size: 16px;
  color: var(--ion-text-color);
}

.receipt-header p {
  margin: 4px 0;
  font-size: 12px;
  color: var(--app-muted);
}

.receipt-content {
  font-size: 13px;
}

.receipt-section {
  margin-bottom: 14px;
  border-bottom: 1px dashed var(--ion-border-color);
  padding-bottom: 10px;
}

.receipt-section:last-child {
  border-bottom: none;
}

.section-title {
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 8px;
  color: var(--ion-text-color);
}

.receipt-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  color: var(--ion-text-color);
}

.receipt-row.total {
  font-weight: bold;
  font-size: 14px;
  border-top: 1px solid var(--ion-border-color);
  border-bottom: 1px solid var(--ion-border-color);
  padding: 8px 0;
  margin-top: 8px;
}

.print-btn {
  --background: linear-gradient(135deg, #c26b2d, #e58b43);
  --border-radius: 16px;
  height: 50px;
  font-weight: 700;
}

@media (max-width: 991px) {
  .toolbar-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .cart-panel {
    position: static;
    margin-top: 16px;
  }
}

@media (max-width: 768px) {
  .brand-logo {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }

  .brand-box h1 {
    font-size: 16px;
  }

  .brand-box p {
    font-size: 11px;
  }

  .menu-panel,
  .cart-panel {
    padding: 14px;
    border-radius: 18px;
  }

  .product-grid :deep(.ion-col) {
    --ion-grid-column-padding: 4px;
  }

  .menu-image-wrap {
    height: 100px;
  }

  .menu-title {
    font-size: 13px;
  }

  .menu-price {
    font-size: 14px;
  }

  .menu-card:hover {
    transform: none;
  }

  .cart-items {
    max-height: 300px;
  }
}

@media (max-width: 480px) {
  .kasir-header ion-toolbar {
    padding: 8px;
  }

  .toolbar-inner {
    gap: 8px;
  }

  .brand-box {
    gap: 8px;
  }

  .brand-logo {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }

  .brand-box h1 {
    font-size: 14px;
  }

  .brand-box p {
    font-size: 10px;
  }

  .menu-panel,
  .cart-panel {
    padding: 12px;
    border-radius: 16px;
  }

  .menu-image-wrap {
    height: 90px;
  }

  .menu-title {
    font-size: 12px;
  }

  .menu-category {
    font-size: 11px;
  }

  .menu-price {
    font-size: 13px;
  }

  .top-tools {
    gap: 10px;
    margin-bottom: 12px;
  }

  .cart-header h2 {
    font-size: 18px;
  }

  .cart-header p {
    font-size: 12px;
  }

  .cart-item {
    padding: 10px;
  }

  .cart-thumb {
    width: 48px;
    height: 48px;
  }

  .cart-item-left h3 {
    font-size: 13px;
  }

  .cart-item-left p {
    font-size: 11px;
  }

  .summary-row {
    font-size: 13px;
  }

  .summary-row.total {
    font-size: 16px;
  }

  .checkout-btn {
    height: 44px;
    font-size: 14px;
  }

  .receipt-preview {
    padding: 16px;
    font-size: 12px;
  }

  .receipt-header h2 {
    font-size: 14px;
  }

  .receipt-logo {
    font-size: 28px;
  }

  .print-btn {
    height: 44px;
    font-size: 14px;
  }
}

@media (max-width: 360px) {
  .menu-card {
    border-radius: 14px;
  }

  .menu-image-wrap {
    height: 80px;
  }

  .cart-items {
    max-height: 250px;
  }
}
</style>