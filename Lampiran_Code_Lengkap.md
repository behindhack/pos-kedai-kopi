# Lampiran Code Lengkap - Views & Utilities
*Project: POS Kedai Kopi*
*Framework: Ionic Vue*

## 1. `src/views/TabsPage.vue`

```vue
<template>
  <ion-page>
    <!-- Header with User Info and Logout -->
    <ion-header class="user-header">
      <ion-toolbar>
        <div class="header-content">
          <div class="user-info">
            <div class="user-avatar">{{ userInitial }}</div>
            <div class="user-details">
              <h3>{{ auth.currentUser?.name }}</h3>
              <p>{{ getRoleLabel(auth.currentUser?.role) }}</p>
            </div>
          </div>
          <ion-button fill="clear" @click="handleLogout" class="logout-btn">
            <ion-icon slot="start" :icon="logOut"></ion-icon>
            Logout
          </ion-button>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-tabs>
      <ion-router-outlet />
      <ion-tab-bar slot="bottom" class="custom-tab-bar">
        <!-- Dashboard Tab - OWNER only -->
        <ion-tab-button v-if="auth.isOwner" tab="dashboard" href="/tabs/dashboard">
          <ion-icon :icon="homeOutline" />
          <ion-label>Home</ion-label>
        </ion-tab-button>

        <!-- Kasir Tab - OWNER & CASHIER -->
        <ion-tab-button v-if="auth.isOwner || auth.isCashier" tab="kasir" href="/tabs/kasir">
          <ion-icon :icon="cashRegister" />
          <ion-label>Kasir</ion-label>
        </ion-tab-button>

        <!-- Pesanan Tab - BARISTA & OWNER -->
        <ion-tab-button v-if="auth.isBarista || auth.isOwner" tab="pesanan" href="/tabs/pesanan">
          <ion-icon :icon="documentText" />
          <ion-label>Pesanan</ion-label>
        </ion-tab-button>

        <!-- Produk Tab - OWNER & CASHIER -->
        <ion-tab-button v-if="auth.isOwner || auth.isCashier" tab="produk" href="/tabs/produk">
          <ion-icon :icon="pricetag" />
          <ion-label>Produk</ion-label>
        </ion-tab-button>

        <!-- Laporan Tab - OWNER only -->
        <ion-tab-button v-if="auth.isOwner" tab="laporan" href="/tabs/laporan">
          <ion-icon :icon="statsChart" />
          <ion-label>Laporan</ion-label>
        </ion-tab-button>

        <!-- Raw Materials Tab - OWNER only -->
        <ion-tab-button v-if="auth.isOwner" tab="raw-materials" href="/tabs/raw-materials">
          <ion-icon :icon="cube" />
          <ion-label>Bahan Baku</ion-label>
        </ion-tab-button>

        <!-- Setting Tab - OWNER only -->
        <ion-tab-button v-if="auth.isOwner" tab="setting" href="/tabs/setting">
          <ion-icon :icon="settings" />
          <ion-label>Setting</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>

    <!-- Logout Confirmation Modal -->
    <ion-alert
      :is-open="showLogoutAlert"
      header="Konfirmasi Logout"
      message="Apakah Anda yakin ingin keluar dari aplikasi?"
      :buttons="logoutButtons"
    />
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonHeader,
  IonToolbar,
  IonButton,
  IonAlert,
  toastController,
} from '@ionic/vue';
import {
  cashOutline as cashRegister,
  pricetag,
  statsChart,
  settings,
  logOut,
  documentText,
  cube,
  homeOutline,
} from 'ionicons/icons';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();
const showLogoutAlert = ref(false);

onMounted(() => {
  auth.loadFromStorage();
});

const userInitial = computed(() => {
  return auth.currentUser?.name?.charAt(0).toUpperCase() || '?';
});

const getRoleLabel = (role?: string): string => {
  switch (role) {
    case 'OWNER':
      return 'Pemilik Toko';
    case 'CASHIER':
      return 'Kasir';
    case 'BARISTA':
      return 'Barista';
    default:
      return 'Unknown';
  }
};

const handleLogout = () => {
  showLogoutAlert.value = true;
};

const confirmLogout = async () => {
  auth.logout();
  showLogoutAlert.value = false;
  
  const toast = await toastController.create({
    message: 'Berhasil logout',
    duration: 2000,
    position: 'bottom',
  });
  await toast.present();
  
  router.replace('/auth/login');
};

const cancelLogout = () => {
  showLogoutAlert.value = false;
};

const logoutButtons = [
  {
    text: 'Batal',
    role: 'cancel',
    handler: cancelLogout,
  },
  {
    text: 'Logout',
    role: 'destructive',
    handler: confirmLogout,
  },
];
</script>

<style scoped>
.user-header ion-toolbar {
  --background: linear-gradient(135deg, #c26b2d, #e58b43);
  --color: #fff;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 8px 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
}

.user-details h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.user-details p {
  margin: 2px 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.logout-btn {
  --color: #fff;
  --padding-end: 8px;
  --padding-start: 8px;
}

.custom-tab-bar {
  --background: var(--app-panel, rgba(255, 255, 255, 0.96));
  --border: none;
  border-top: 1px solid var(--app-border, #edf0f5);
  box-shadow: var(--app-soft-shadow, 0 -8px 30px rgba(15, 23, 42, 0.06));
  padding-top: 6px;
  padding-bottom: 10px;
}

ion-tab-button {
  --color: #8b95a7;
  --color-selected: #c26b2d;
  min-height: 60px;
}

ion-tab-button.tab-selected {
  font-weight: 700;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 6px 0;
  }

  .user-info {
    width: 100%;
    gap: 10px;
  }

  .user-avatar {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .user-details h3 {
    font-size: 14px;
    margin: 0;
  }

  .user-details p {
    font-size: 11px;
    margin: 1px 0 0;
  }

  .logout-btn {
    width: 100%;
    font-size: 13px;
  }

  .custom-tab-bar {
    padding-top: 4px;
    padding-bottom: 8px;
  }

  ion-tab-button {
    min-height: 50px;
  }

  ion-tab-button ion-icon {
    font-size: 20px;
  }

  ion-tab-button ion-label {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .user-header ion-toolbar {
    padding: 4px 8px;
  }

  .header-content {
    gap: 6px;
    padding: 4px 0;
  }

  .user-info {
    gap: 8px;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    font-size: 14px;
    flex-shrink: 0;
  }

  .user-details h3 {
    font-size: 12px;
    margin: 0;
  }

  .user-details p {
    font-size: 10px;
    margin: 0;
  }

  .logout-btn {
    font-size: 12px;
    --padding-end: 6px;
    --padding-start: 6px;
    height: 32px;
  }

  .logout-btn ion-icon {
    font-size: 18px;
  }

  .custom-tab-bar {
    padding-top: 2px;
    padding-bottom: 4px;
    --border: none;
  }

  ion-tab-button {
    min-height: 44px;
  }

  ion-tab-button ion-icon {
    font-size: 18px;
    margin-bottom: 2px;
  }

  ion-tab-button ion-label {
    font-size: 10px;
    display: block;
  }
}

@media (max-width: 360px) {
  .logout-btn {
    width: 100%;
    margin-top: 2px;
  }

  ion-tab-button ion-label {
    font-size: 9px;
  }
}
</style>
```

---

## 2. `src/views/KasirPage.vue`

```vue
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

              <ion-button
                expand="block"
                class="checkout-btn"
                :disabled="!sales.currentCart.length"
                @click="openPayment"
              >
                Bayar Sekarang
              </ion-button>
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
              <div class="receipt-logo">{{ shopStore.settings.shopLogo }}</div>
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
                <div v-if="lastSale.payment.change > 0" class="receipt-row">
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
  toastController,
} from '@ionic/vue';
import { sunnyOutline, moonOutline, printOutline } from 'ionicons/icons';
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
```

---

## 3. `src/views/auth/LoginPage.vue`

```vue
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>KopiKas - Login</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding ion-content-login">
      <div class="login-container">
        <div class="logo-box">
          <div class="logo-icon">
            <img src="/assets/kopikas-logo.png" alt="Kopikas Logo" style="width: 100%; height: 100%; object-fit: contain;" />
          </div>
          <h1 class="logo-title">KOPIKAS</h1>
          <p class="logo-subtitle">Sistem Kasir Kedai Kopi</p>
        </div>

        <div v-if="generalError" class="error-banner">
          <ion-icon :icon="alertCircleOutline" />
          <span>{{ generalError }}</span>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label class="form-label">Email</label>
            <ion-item :color="errors.email ? 'danger' : ''" lines="none" class="custom-input-item">
              <ion-input
                v-model="email"
                type="email"
                placeholder="Masukkan email Anda"
                @ionBlur="validateEmail"
              />
            </ion-item>
            <div v-if="errors.email" class="error-text">
              <ion-icon :icon="alertCircleOutline" />
              {{ errors.email }}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <ion-item :color="errors.password ? 'danger' : ''" lines="none" class="custom-input-item">
              <ion-input
                v-model="password"
                type="password"
                placeholder="Masukkan password Anda"
                @ionBlur="validatePassword"
              />
            </ion-item>
            <div v-if="errors.password" class="error-text">
              <ion-icon :icon="alertCircleOutline" />
              {{ errors.password }}
            </div>
            <div class="forgot-password-link">
              <router-link to="/auth/forgot-password">Lupa Password?</router-link>
            </div>
          </div>

          <ion-button
            type="submit"
            expand="block"
            class="login-button"
            :disabled="isLoading || !isFormValid"
          >
            <ion-spinner v-if="isLoading" name="crescent" slot="start" />
            {{ isLoading ? 'Sedang login...' : 'Masuk' }}
          </ion-button>
        </form>

        <div class="register-section">
          <p class="register-text">Belum memiliki akun?</p>
          <ion-button expand="block" fill="clear" @click="goRegister" class="register-button">
            Buat Akun Baru
          </ion-button>
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
  IonTitle,
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonSpinner,
  IonIcon,
} from '@ionic/vue';
import { alertCircleOutline } from 'ionicons/icons';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useNotification } from '@/composables/useNotification';
import { validateEmail as validateEmailFormat, validatePassword as validatePasswordFormat } from '@/utils/validators';

const router = useRouter();
const auth = useAuthStore();
const { showSuccess, showError } = useNotification();

const email = ref('');
const password = ref('');
const isLoading = ref(false);
const generalError = ref('');
const errors = ref<Record<string, string>>({});

const isFormValid = computed(() => {
  return email.value.trim() && password.value.trim() && !Object.keys(errors.value).length;
});

const validateEmail = () => {
  const validation = validateEmailFormat(email.value);
  if (validation.length) {
    errors.value.email = validation[0].message;
  } else {
    delete errors.value.email;
  }
};

const validatePassword = () => {
  const validation = validatePasswordFormat(password.value);
  if (validation.length) {
    errors.value.password = validation[0].message;
  } else {
    delete errors.value.password;
  }
};

const handleLogin = async () => {
  validateEmail();
  validatePassword();

  if (!isFormValid.value) {
    await showError('Mohon perbaiki form terlebih dahulu');
    return;
  }

  isLoading.value = true;
  generalError.value = '';

  try {
    const result = await auth.login(email.value, password.value);
    
    if (result.success) {
      await showSuccess('Login berhasil!');
      
      // Redirect based on user role
      const userRole = auth.currentUser?.role;
      if (userRole === 'BARISTA') {
        router.replace('/tabs/pesanan');
      } else {
        router.replace('/tabs/kasir');
      }
    } else {
      generalError.value = result.error || 'Login gagal';
      await showError(generalError.value);
    }
  } catch (error: any) {
    generalError.value = error.message || 'Terjadi kesalahan';
    await showError(generalError.value);
  } finally {
    isLoading.value = false;
  }
};

const goRegister = () => {
  router.push('/auth/register');
};

</script>

<style scoped>
:deep(.ion-content-login) {
  --padding-top: 20px;
  --padding-bottom: 20px;
  --padding-start: 16px;
  --padding-end: 16px;
}

.login-container {
  max-width: 400px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 24px;
}

.logo-box {
  text-align: center;
  margin-bottom: 16px;
  animation: fadeInScale 0.6s ease-out;
}

.logo-icon {
  width: 240px;
  height: 240px;
  margin: 0 auto 12px;
}

.logo-title {
  font-size: 40px;
  font-weight: 800;
  letter-spacing: 6px;
  margin: 0;
  background: linear-gradient(135deg, #D4A76A 0%, #8B6914 40%, #6F4E37 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
}

.logo-subtitle {
  font-size: 13px;
  font-weight: 500;
  color: #B8956A;
  margin: 6px 0 0 0;
  letter-spacing: 2px;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.85);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: var(--ion-color-danger);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  animation: slideDown 0.3s ease;
}

.error-banner ion-icon {
  flex-shrink: 0;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.custom-input-item {
  --padding-start: 14px;
  --padding-end: 14px;
  --min-height: 48px;
  --background: var(--app-input-bg);
  border: 1.5px solid var(--ion-border-color);
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.custom-input-item:hover {
  --box-shadow: var(--app-shadow-sm);
}

.custom-input-item:focus-within {
  --border-color: var(--ion-color-primary);
  border: 1.5px solid var(--ion-color-primary);
  box-shadow: 0 0 0 4px var(--app-info-bg);
}

.error-text {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--ion-color-danger);
  font-size: 12px;
  padding: 0 4px;
}

.error-text ion-icon {
  font-size: 14px;
}

.login-button {
  height: 48px;
  font-weight: 600;
  font-size: 16px;
  margin-top: 8px;
  --border-radius: 8px;
}

.forgot-password-link {
  text-align: right;
  margin-top: 4px;
}

.forgot-password-link a {
  font-size: 13px;
  color: var(--ion-color-primary);
  text-decoration: none;
  font-weight: 500;
}

.forgot-password-link a:hover {
  text-decoration: underline;
}

.register-section {
  text-align: center;
  border-top: 1px solid var(--ion-color-step-200);
  padding-top: 20px;
}

.register-text {
  font-size: 13px;
  color: var(--ion-color-medium);
  margin: 0 0 8px 0;
}

.register-button {
  font-weight: 500;
  --color: var(--ion-color-primary);
}


/* Responsive Design */
@media (max-width: 480px) {
  .login-container {
    padding: 0;
    gap: 20px;
  }

  .logo-icon {
    width: 90px;
    height: 90px;
  }

  .logo-title {
    font-size: 32px;
    letter-spacing: 4px;
  }

  .logo-subtitle {
    font-size: 11px;
  }

  :deep(.ion-content-login) {
    --padding-top: 16px;
    --padding-start: 12px;
    --padding-end: 12px;
  }
}

@media (min-width: 768px) {
  .login-container {
    min-height: 100vh;
  }

  .logo-icon {
    width: 140px;
    height: 140px;
  }

  .logo-title {
    font-size: 48px;
    letter-spacing: 8px;
  }

  .logo-subtitle {
    font-size: 15px;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .logo-subtitle {
    color: #C9A97A;
  }

  .form-label {
    color: var(--ion-color-light);
  }
}
</style>
```

---

## 4. `src/views/auth/RegisterPage.vue`

```vue
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Register</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding ion-content-register">
      <div class="register-container">
        <div class="logo-box">
          <h1 class="logo-title" style="display: flex; align-items: center; justify-content: center; gap: 8px;"><ion-icon :icon="cafeOutline"></ion-icon> Buat Akun</h1>
          <p class="subtitle">Daftar akun POS Kedai Kopi</p>
        </div>

        <div v-if="generalError" class="error-banner">
          <ion-icon :icon="alertCircleOutline" />
          <span>{{ generalError }}</span>
        </div>

        <div v-if="isCheckingSetup" class="loading-state">
          <ion-spinner name="crescent" />
          <p>Memeriksa status sistem...</p>
        </div>

        <div v-else-if="isRegistrationClosed" class="closed-state">
          <ion-icon :icon="alertCircleOutline" class="closed-icon" />
          <h3>Pendaftaran Ditutup</h3>
          <p>Pendaftaran publik tidak diizinkan. Silakan minta Owner / Admin untuk membuatkan akun untuk Anda.</p>
        </div>

        <form v-else @submit.prevent="handleRegister" class="register-form">
          <div class="form-group">
            <label class="form-label">Nama Lengkap</label>
            <ion-item :color="errors.name ? 'danger' : ''" lines="none" class="custom-input-item">
              <ion-input
                v-model="name"
                type="text"
                placeholder="Masukkan nama lengkap"
                @ionBlur="validateName"
              />
            </ion-item>
            <div v-if="errors.name" class="error-text">
              <ion-icon :icon="alertCircleOutline" />
              {{ errors.name }}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Email</label>
            <ion-item :color="errors.email ? 'danger' : ''" lines="none" class="custom-input-item">
              <ion-input
                v-model="email"
                type="email"
                placeholder="Masukkan email Anda"
                @ionBlur="validateEmail"
              />
            </ion-item>
            <div v-if="errors.email" class="error-text">
              <ion-icon :icon="alertCircleOutline" />
              {{ errors.email }}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <ion-item :color="errors.password ? 'danger' : ''" lines="none" class="custom-input-item">
              <ion-input
                v-model="password"
                type="password"
                placeholder="Masukkan password"
                @ionBlur="validatePassword"
              />
            </ion-item>
            <div v-if="errors.password" class="error-text">
              <ion-icon :icon="alertCircleOutline" />
              {{ errors.password }}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Konfirmasi Password</label>
            <ion-item :color="errors.confirmPassword ? 'danger' : ''" lines="none" class="custom-input-item">
              <ion-input
                v-model="confirmPassword"
                type="password"
                placeholder="Konfirmasi password Anda"
                @ionBlur="validateConfirmPassword"
              />
            </ion-item>
            <div v-if="errors.confirmPassword" class="error-text">
              <ion-icon :icon="alertCircleOutline" />
              {{ errors.confirmPassword }}
            </div>
          </div>

          <!-- Role dropdown removed, role is strictly OWNER during setup -->
          <ion-button
            type="submit"
            expand="block"
            class="register-button"
            :disabled="isLoading || !isFormValid"
          >
            <ion-spinner v-if="isLoading" name="crescent" slot="start" />
            {{ isLoading ? 'Sedang mendaftar...' : 'Daftar' }}
          </ion-button>
        </form>

        <div class="login-section">
          <p class="login-text">Sudah memiliki akun?</p>
          <ion-button expand="block" fill="clear" @click="goLogin" class="login-button">
            Kembali ke Login
          </ion-button>
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
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonSpinner,
  IonIcon,
} from '@ionic/vue';
import { alertCircleOutline, cafeOutline } from 'ionicons/icons';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useNotification } from '@/composables/useNotification';
import { apiClient } from '@/services/api';
import {
  validateEmail as validateEmailFormat,
  validatePassword as validatePasswordFormat,
} from '@/utils/validators';

const router = useRouter();
const auth = useAuthStore();
const { showSuccess, showError } = useNotification();

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const role = ref('OWNER');
const isLoading = ref(false);
const isCheckingSetup = ref(true);
const isRegistrationClosed = ref(false);
const generalError = ref('');
const errors = ref<Record<string, string>>({});

const isFormValid = computed(() => {
  return (
    name.value.trim() &&
    email.value.trim() &&
    password.value.trim() &&
    confirmPassword.value.trim() &&
    !Object.keys(errors.value).length
  );
});

onMounted(async () => {
  try {
    const res = await apiClient.checkSetupStatus();
    if (res.data && res.data.isSetup) {
      isRegistrationClosed.value = true;
    } else {
      isRegistrationClosed.value = false;
      role.value = 'OWNER'; // Only OWNER can be created here
    }
  } catch (err) {
    console.error('Failed to check setup status', err);
    // If it fails, assume it's closed just to be safe
    isRegistrationClosed.value = true;
  } finally {
    isCheckingSetup.value = false;
  }
});

const validateName = () => {
  if (!name.value.trim()) {
    errors.value.name = 'Nama lengkap wajib diisi';
  } else if (name.value.trim().length < 2) {
    errors.value.name = 'Nama minimal 2 karakter';
  } else {
    delete errors.value.name;
  }
};

const validateEmail = () => {
  const validation = validateEmailFormat(email.value);
  if (validation.length) {
    errors.value.email = validation[0].message;
  } else {
    delete errors.value.email;
  }
};

const validatePassword = () => {
  const validation = validatePasswordFormat(password.value);
  if (validation.length) {
    errors.value.password = validation[0].message;
  } else {
    delete errors.value.password;
  }
};

const validateConfirmPassword = () => {
  if (!confirmPassword.value) {
    errors.value.confirmPassword = 'Konfirmasi password wajib diisi';
  } else if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = 'Password tidak cocok';
  } else {
    delete errors.value.confirmPassword;
  }
};

const handleRegister = async () => {
  validateName();
  validateEmail();
  validatePassword();
  validateConfirmPassword();

  if (!isFormValid.value) {
    await showError('Mohon perbaiki form terlebih dahulu');
    return;
  }

  isLoading.value = true;
  generalError.value = '';

  try {
    const result = await auth.register(email.value, password.value, name.value, role.value);

    if (result.success) {
      await showSuccess('Registrasi berhasil!');
      const userRole = auth.currentUser?.role;
      if (userRole === 'BARISTA') {
        router.replace('/tabs/pesanan');
      } else {
        router.replace('/tabs/kasir');
      }
    } else {
      generalError.value = result.error || 'Registrasi gagal';
      await showError(generalError.value);
    }
  } catch (error: any) {
    generalError.value = error.message || 'Terjadi kesalahan';
    await showError(generalError.value);
  } finally {
    isLoading.value = false;
  }
};

const goLogin = () => {
  router.push('/auth/login');
};
</script>

<style scoped>
:deep(.ion-content-register) {
  --padding-top: 20px;
  --padding-bottom: 20px;
  --padding-start: 16px;
  --padding-end: 16px;
}

.register-container {
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.logo-box {
  text-align: center;
  margin-bottom: 16px;
}

.logo-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--ion-color-primary);
}

.subtitle {
  color: var(--ion-color-medium);
  font-size: 14px;
  margin: 0;
  font-weight: 500;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: var(--ion-color-danger);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  animation: slideDown 0.3s ease;
}

.error-banner ion-icon {
  flex-shrink: 0;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.custom-input-item {
  --padding-start: 14px;
  --padding-end: 14px;
  --min-height: 48px;
  --background: var(--app-input-bg);
  border: 1.5px solid var(--ion-border-color);
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.custom-input-item:hover {
  --box-shadow: var(--app-shadow-sm);
}

.custom-input-item:focus-within {
  --border-color: var(--ion-color-primary);
  border: 1.5px solid var(--ion-color-primary);
  box-shadow: 0 0 0 4px var(--app-info-bg);
}

.error-text {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--ion-color-danger);
  font-size: 12px;
  padding: 0 4px;
}

.error-text ion-icon {
  font-size: 14px;
}

.register-button {
  height: 48px;
  font-weight: 600;
  font-size: 16px;
  margin-top: 8px;
  --border-radius: 8px;
}

.login-section {
  text-align: center;
  border-top: 1px solid var(--ion-color-step-200);
  padding-top: 20px;
}

.login-text {
  font-size: 13px;
  color: var(--ion-color-medium);
  margin: 0 0 8px 0;
}

.login-button {
  font-weight: 500;
  --color: var(--ion-color-primary);
}

.loading-state,
.closed-state {
  text-align: center;
  padding: 40px 20px;
  background: var(--ion-background-color);
  border-radius: 12px;
  margin-bottom: 20px;
  border: 1px solid var(--ion-color-step-150);
}

.closed-state .closed-icon {
  font-size: 48px;
  color: var(--ion-color-warning);
  margin-bottom: 16px;
}

.closed-state h3 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 600;
  color: var(--ion-text-color);
}

.closed-state p {
  margin: 0;
  font-size: 14px;
  color: var(--ion-color-medium);
  line-height: 1.5;
}

/* Responsive Design */
@media (max-width: 480px) {
  .register-container {
    padding: 0;
    gap: 20px;
  }

  .logo-title {
    font-size: 28px;
  }

  :deep(.ion-content-register) {
    --padding-top: 16px;
    --padding-start: 12px;
    --padding-end: 12px;
  }
}

@media (min-width: 768px) {
  .register-container {
    min-height: 100vh;
    justify-content: center;
  }

  .logo-title {
    font-size: 36px;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .logo-title {
    color: var(--ion-color-primary);
  }

  .form-label {
    color: var(--ion-color-light);
  }
}
</style>
```

---

## 5. `src/utils/print.ts`

```typescript
import type { Sale, ShopSettings } from '../types';

export const printReceipt = (sale: Sale, shopSettings: ShopSettings) => {
  const { printSettings } = shopSettings;
  
  // Create a new window for printing
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) return;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(val);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatCategory = (cat: string) => {
    const categories: Record<string, string> = {
      ESPRESSO: 'Espresso',
      MANUAL_BREW: 'Manual Brew',
      NON_COFFEE: 'Non Coffee',
      FOOD: 'Food',
    };
    return categories[cat] || cat;
  };

  const paperWidthInch = printSettings.paperWidth / 25.4; // convert mm to inch
  const pageWidth = `${paperWidthInch}in`;

  let receiptContent = `
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Struk Pembayaran</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Courier New', monospace;
            background: #fff;
            padding: 0;
          }
          
          @media print {
            body {
              margin: 0;
              padding: 0;
              width: ${pageWidth};
            }
          }
          
          .receipt-container {
            width: ${pageWidth};
            padding: 10px;
            margin: 0 auto;
          }
          
          .receipt-header {
            text-align: center;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          
          .shop-logo {
            font-size: 32px;
            margin: 5px 0;
          }
          
          .shop-name {
            font-weight: bold;
            font-size: 14px;
            margin: 5px 0;
          }
          
          .shop-info {
            font-size: 11px;
            line-height: 1.3;
            color: #333;
          }
          
          .receipt-section {
            margin-bottom: 10px;
          }
          
          .section-title {
            font-weight: bold;
            font-size: 12px;
            margin-top: 10px;
            margin-bottom: 5px;
            border-bottom: 1px dashed #000;
            padding-bottom: 3px;
          }
          
          .item-row {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            margin-bottom: 3px;
            line-height: 1.2;
          }
          
          .item-name {
            flex: 1;
            max-width: 60%;
            word-wrap: break-word;
          }
          
          .item-qty {
            text-align: center;
            min-width: 20px;
          }
          
          .item-price {
            text-align: right;
            min-width: 50px;
          }
          
          .summary-section {
            border-top: 1px dashed #000;
            padding-top: 8px;
            margin-top: 10px;
          }
          
          .summary-row {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            margin-bottom: 3px;
          }
          
          .summary-row.total {
            font-weight: bold;
            font-size: 12px;
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
            padding: 5px 0;
            margin-top: 5px;
          }
          
          .payment-info {
            font-size: 11px;
            margin-top: 10px;
            border-top: 1px dashed #000;
            padding-top: 8px;
          }
          
          .payment-method {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
          }
          
          .footer {
            text-align: center;
            font-size: 10px;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px dashed #000;
          }
          
          .thank-you {
            font-weight: bold;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="receipt-header">
  `;

  if (printSettings.showLogo) {
    receiptContent += `<div class="shop-logo">${shopSettings.shopLogo}</div>`;
  }

  receiptContent += `
            <div class="shop-name">${shopSettings.shopName}</div>
  `;

  if (printSettings.showAddress && shopSettings.address) {
    receiptContent += `<div class="shop-info">${shopSettings.address}</div>`;
  }

  if (shopSettings.phone) {
    receiptContent += `<div class="shop-info">${shopSettings.phone}</div>`;
  }

  receiptContent += `
            <div class="shop-info">${formatDate(sale.date)}</div>
          </div>
          
          <div class="receipt-section">
            <div class="section-title">DETAIL PESANAN</div>
  `;

  if (sale.customerName) {
    receiptContent += `<div class="item-row"><strong>Nama:</strong> <strong>${sale.customerName}</strong></div>`;
  }

  receiptContent += `
            <div class="item-row">
              <strong>Tipe:</strong>
              <strong>${sale.orderType === 'DINE_IN' ? 'Makan di Tempat' : 'Take Away'}</strong>
            </div>
          </div>
          
          <div class="receipt-section">
            <div class="section-title">ITEM</div>
  `;

  sale.items.forEach((item) => {
    const itemTotal = (item.product.basePrice) * item.qty;
    receiptContent += `
      <div class="item-row">
        <div class="item-name">${item.product.name}</div>
        <div class="item-qty">${item.qty}x</div>
        <div class="item-price">${formatCurrency(itemTotal)}</div>
      </div>
    `;
  });

  receiptContent += `
          </div>
          
          <div class="summary-section">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>${formatCurrency(sale.subtotal)}</span>
            </div>
  `;

  if (sale.discount > 0) {
    receiptContent += `
      <div class="summary-row">
        <span>Diskon</span>
        <span>- ${formatCurrency(sale.discount)}</span>
      </div>
    `;
  }

  if (sale.tax > 0) {
    receiptContent += `
      <div class="summary-row">
        <span>Pajak</span>
        <span>${formatCurrency(sale.tax)}</span>
      </div>
    `;
  }

  receiptContent += `
            <div class="summary-row total">
              <span>TOTAL</span>
              <span>${formatCurrency(sale.total)}</span>
            </div>
          </div>
          
          <div class="payment-info">
            <div class="payment-method">
              <span>Pembayaran</span>
              <span>${sale.payment.method}</span>
            </div>
            <div class="payment-method">
              <span>Dibayar</span>
              <span>${formatCurrency(sale.payment.paidAmount)}</span>
            </div>
  `;

  if (sale.payment.change > 0) {
    receiptContent += `
      <div class="payment-method">
        <span>Kembalian</span>
        <span>${formatCurrency(sale.payment.change)}</span>
      </div>
    `;
  }

  receiptContent += `
          </div>
          
          <div class="footer">
            <div class="thank-you">Terima Kasih!</div>
            <div>Selamat datang kembali</div>
          </div>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 500);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(receiptContent);
  printWindow.document.close();
};

```

---

## 6. `src/stores/products.ts`

```typescript
import { defineStore } from 'pinia';
import type { Product } from '../types';
import { apiClient } from '../services/api';

export const useProductStore = defineStore('products', {
  state: () => ({
    products: [] as Product[],
    isLoading: false,
    error: null as string | null,
  }),

  actions: {
    loadFromStorage() {
      // Load products from API (which uses localStorage)
      this.loadProducts();
    },

    async loadProducts(category?: string) {
      this.isLoading = true;
      this.error = null;
      try {
        const result = await apiClient.getProducts(category);
        if ((result as any).error) {
          this.error = (result as any).error;
          return;
        }
        this.products = result.data?.products || [];
      } catch (error: any) {
        this.error = error.message;
      } finally {
        this.isLoading = false;
      }
    },

    async addProduct(product: Product) {
      this.isLoading = true;
      this.error = null;
      try {
        const result = await apiClient.createProduct(product);
        if ((result as any).error) {
          this.error = (result as any).error;
          return { success: false };
        }
        const newProduct = result.data?.product;
        if (newProduct) {
          this.products.push(newProduct);
        }
        return { success: true };
      } catch (error: any) {
        this.error = error.message;
        return { success: false };
      } finally {
        this.isLoading = false;
      }
    },

    async updateProduct(id: string, product: Product) {
      this.isLoading = true;
      this.error = null;
      try {
        const result = await apiClient.updateProduct(id, product);
        if ((result as any).error) {
          this.error = (result as any).error;
          return { success: false };
        }
        const index = this.products.findIndex((p) => p.id === id);
        const updatedProduct = result.data?.product;
        if (index !== -1 && updatedProduct) {
          this.products[index] = updatedProduct;
        }
        return { success: true };
      } catch (error: any) {
        this.error = error.message;
        return { success: false };
      } finally {
        this.isLoading = false;
      }
    },

    async deleteProduct(id: string) {
      this.isLoading = true;
      this.error = null;
      try {
        const result = await apiClient.deleteProduct(id);
        if (result.error) {
          this.error = result.error;
          return { success: false };
        }
        this.products = this.products.filter((p) => p.id !== id);
        return { success: true };
      } catch (error: any) {
        this.error = error.message;
        return { success: false };
      } finally {
        this.isLoading = false;
      }
    },
  },
});
```

---

