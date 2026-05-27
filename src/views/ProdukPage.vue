<template>
  <ion-page>
    <ion-header class="page-header">
      <ion-toolbar>
        <ion-title>Produk</ion-title>
        <ion-buttons slot="end">
          <!-- Dark mode toggle -->
          <ion-button @click="toggleTheme" aria-label="Toggle dark mode">
            <ion-icon :icon="isDark ? sunnyOutline : moonOutline" slot="icon-only"></ion-icon>
          </ion-button>
          <ion-button @click="openAddModal">Tambah</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="page-content">
      <div class="page-shell">
        <div class="panel">
          <ion-segment v-model="selectedCategory" class="category-segment">
            <ion-segment-button value="ALL"><ion-label>Semua</ion-label></ion-segment-button>
            <ion-segment-button value="ESPRESSO"><ion-label>Espresso</ion-label></ion-segment-button>
            <ion-segment-button value="MANUAL_BREW"><ion-label>Manual Brew</ion-label></ion-segment-button>
            <ion-segment-button value="NON_COFFEE"><ion-label>Non Coffee</ion-label></ion-segment-button>
            <ion-segment-button value="FOOD"><ion-label>Food</ion-label></ion-segment-button>
          </ion-segment>

          <!-- Tombol Tambah Produk Prominent -->
          <ion-button expand="block" color="primary" fill="solid" class="add-product-btn" @click="openAddModal">
            <ion-icon icon="addCircleOutline" slot="start"></ion-icon>
            ➕ Tambah Produk Baru
          </ion-button>

          <ion-grid class="product-grid">
            <ion-row>
              <ion-col size="6" size-md="4" size-xl="3" v-for="p in filteredProducts" :key="p.id">
                <ion-card class="product-card">
                  <div class="product-image-wrap">
                    <img v-if="p.image" :src="p.image" alt="Gambar produk" class="product-image" />
                    <div v-else class="product-placeholder">☕</div>
                  </div>
                  <ion-card-header>
                    <ion-card-title>{{ p.name }}</ion-card-title>
                  </ion-card-header>
                  <ion-card-content>
                    <p class="category">{{ formatCategory(p.category) }}</p>
                    <p class="price">{{ formatCurrency(p.basePrice) }}</p>
                    <div class="action-buttons">
                      <ion-button size="small" fill="outline" @click="editProduct(p)">
                        ✏️ Edit
                      </ion-button>
                      <ion-button size="small" fill="outline" color="danger" @click="confirmDelete(p)">
                        🗑️ Hapus
                      </ion-button>
                    </div>
                  </ion-card-content>
                </ion-card>
              </ion-col>
            </ion-row>
          </ion-grid>
        </div>

        <ion-modal :is-open="showModal" @didDismiss="closeModal" class="product-modal">
          <ion-header>
            <ion-toolbar>
              <ion-title>{{ editingProduct ? '✏️ Edit Produk' : '➕ Tambah Produk Baru' }}</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="closeModal">Tutup</ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>

          <ion-content class="ion-padding">
            <!-- Nama Produk -->
            <ion-item class="form-item">
              <ion-label position="stacked">📝 Nama Produk</ion-label>
              <ion-input 
                v-model="form.name" 
                placeholder="Masukkan nama produk"
                clearInput
              />
            </ion-item>

            <!-- Kategori -->
            <ion-item class="form-item">
              <ion-label position="stacked">🏷️ Kategori</ion-label>
              <ion-select v-model="form.category" placeholder="Pilih kategori">
                <ion-select-option value="ESPRESSO">☕ Espresso Based</ion-select-option>
                <ion-select-option value="MANUAL_BREW">🫖 Manual Brew</ion-select-option>
                <ion-select-option value="NON_COFFEE">🥤 Non Coffee</ion-select-option>
                <ion-select-option value="FOOD">🥐 Food / Pastry</ion-select-option>
              </ion-select>
            </ion-item>

            <!-- Harga Dasar -->
            <ion-item class="form-item">
              <ion-label position="stacked">💰 Harga Dasar (Rp)</ion-label>
              <ion-input 
                v-model.number="form.basePrice" 
                type="number" 
                placeholder="Contoh: 25000"
                inputmode="decimal"
              />
            </ion-item>

            <!-- Upload Gambar -->
            <div class="upload-section">
              <label class="upload-label">🖼️ Upload Gambar Produk</label>
              <div class="file-input-wrapper">
                <input 
                  type="file" 
                  accept="image/*" 
                  @change="handleImageUpload"
                  id="product-image-input"
                  class="file-input"
                />
                <label for="product-image-input" class="file-label">
                  📁 Pilih Gambar (JPG, PNG, GIF)
                </label>
              </div>
            </div>

            <!-- Preview Gambar -->
            <div v-if="form.image" class="preview-box">
              <p class="preview-title">Preview Gambar:</p>
              <img :src="form.image" alt="Preview produk" class="preview-image" />
              <ion-button size="small" fill="clear" color="danger" @click="form.image = ''">
                ❌ Hapus Gambar
              </ion-button>
            </div>

            <!-- Info -->
            <div class="info-box">
              <p><strong>Info:</strong></p>
              <ul>
                <li>Nama dan kategori harus diisi</li>
                <li>Gambar akan di-resize otomatis ke 250x250px</li>
                <li>Format: JPG, PNG, GIF, atau WebP (maks 2MB)</li>
              </ul>
            </div>

            <!-- Action Buttons -->
            <ion-button expand="block" fill="solid" color="primary" class="save-btn" @click="saveProduct">
              💾 Simpan Produk
            </ion-button>

            <ion-button expand="block" fill="outline" @click="closeModal">
              ❌ Batal
            </ion-button>
          </ion-content>
        </ion-modal>

        <!-- Delete Confirmation Modal -->
        <ion-modal :is-open="showDeleteConfirm" @didDismiss="closeDeleteConfirm">
          <ion-header>
            <ion-toolbar>
              <ion-title>Konfirmasi Hapus</ion-title>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <ion-item>
              <img v-if="productToDelete?.image" :src="productToDelete.image" alt="Produk" class="confirm-image" />
              <div v-else class="confirm-placeholder">☕</div>
            </ion-item>
            <p class="confirm-text">
              Apakah Anda yakin ingin menghapus produk <strong>{{ productToDelete?.name }}</strong>?
            </p>
            <ion-button expand="block" fill="solid" color="danger" @click="confirmDeleteAction">
              🗑️ Hapus Produk
            </ion-button>
            <ion-button expand="block" fill="outline" @click="closeDeleteConfirm">
              ❌ Batal
            </ion-button>
          </ion-content>
        </ion-modal>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonSegment, IonSegmentButton, IonLabel, IonGrid, IonRow, IonCol,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonModal,
  IonItem, IonInput, IonSelect, IonSelectOption, toastController, IonIcon
} from '@ionic/vue';
import { ref, computed, onMounted } from 'vue';
import { useProductStore } from '../stores/products';
import { useTheme } from '../composables/useTheme';
import { formatCurrency, formatCategory } from '../utils/formatters';
import { validateProductForm } from '../utils/validators';
import type { Product } from '../types';
import { sunnyOutline, moonOutline, addCircleOutline } from 'ionicons/icons';

const productStore = useProductStore();
const { isDark, toggleTheme } = useTheme();
const selectedCategory = ref<'ALL' | Product['category']>('ALL');
const showModal = ref(false);
const showDeleteConfirm = ref(false);
const editingProduct = ref<Product | null>(null);
const productToDelete = ref<Product | null>(null);

const form = ref<{
  id?: string;
  name: string;
  category: Product['category'] | '';
  basePrice: number;
  image?: string;
}>({ name: '', category: '' as any, basePrice: 0, image: '' });

onMounted(() => {
  productStore.loadFromStorage();
});

const filteredProducts = computed(() => {
  if (selectedCategory.value === 'ALL') return productStore.products;
  return productStore.products.filter((p) => p.category === selectedCategory.value);
});

const openAddModal = () => {
  editingProduct.value = null;
  form.value = { name: '', category: '' as any, basePrice: 0, image: '' };
  showModal.value = true;
};

const editProduct = (p: Product) => {
  editingProduct.value = p;
  form.value = {
    id: p.id,
    name: p.name,
    category: p.category,
    basePrice: p.basePrice,
    image: p.image || '',
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingProduct.value = null;
  form.value = { name: '', category: '' as any, basePrice: 0, image: '' };
};

const confirmDelete = (p: Product) => {
  productToDelete.value = p;
  showDeleteConfirm.value = true;
};

const closeDeleteConfirm = () => {
  showDeleteConfirm.value = false;
  productToDelete.value = null;
};

const confirmDeleteAction = async () => {
  if (!productToDelete.value) return;
  await productStore.deleteProduct(productToDelete.value.id);
  const toast = await toastController.create({ 
    message: `Produk "${productToDelete.value.name}" berhasil dihapus`, 
    duration: 2000, 
    position: 'top',
    color: 'success'
  });
  await toast.present();
  closeDeleteConfirm();
};

const resizeImage = (
  file: File,
  maxWidth = 250,
  maxHeight = 250,
  quality = 0.65
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas context tidak tersedia')); return; }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Gagal membaca gambar'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsDataURL(file);
  });
};

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  try {
    form.value.image = await resizeImage(file, 250, 250, 0.65);
  } catch {
    const toast = await toastController.create({ message: 'Gagal memproses gambar', duration: 1500, position: 'top', color: 'danger' });
    await toast.present();
  }
};

const saveProduct = async () => {
  const errors = validateProductForm(form.value);
  
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
  
  const toast = await toastController.create({ duration: 1500, position: 'top' });
  if (editingProduct.value) {
    productStore.updateProduct(form.value.id!, { id: form.value.id!, name: form.value.name, category: form.value.category as Product['category'], basePrice: form.value.basePrice, image: form.value.image, isActive: true });
    toast.message = 'Produk diperbarui';
  } else {
    productStore.addProduct({ id: Date.now().toString(), name: form.value.name, category: form.value.category as Product['category'], basePrice: form.value.basePrice, image: form.value.image, isActive: true });
    toast.message = 'Produk ditambahkan';
  }
  await toast.present();
  closeModal();
};
</script>

<style scoped>
.page-content {
  --background: var(--ion-background-color, #f5f7fb);
}
.page-header ion-toolbar {
  --background: var(--ion-toolbar-background, #ffffff);
  --color: var(--ion-text-color, #1f2937);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}
.page-shell { padding: 16px; }
.panel {
  background: var(--app-card-bg);
  border-radius: var(--app-card-radius);
  box-shadow: var(--app-soft-shadow);
  padding: 18px;
}
.category-segment {
  background: var(--app-panel-2);
  border-radius: 16px;
  padding: 4px;
  margin-bottom: 18px;
}
.product-grid { padding: 0; }
.product-card {
  margin: 0;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: var(--app-shadow-sm);
  border: 1px solid var(--ion-border-color);
  background: var(--app-panel);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--app-shadow-lg);
  border-color: var(--ion-color-primary);
}
.card-clickable { cursor: pointer; }
.product-image-wrap {
  height: 120px;
  background: var(--app-input-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}
:deep(body.dark) .product-image-wrap {
  background: var(--app-panel-2);
}
.product-image { width: 100%; height: 100%; object-fit: cover; }
.product-placeholder { font-size: 36px; }
.category {
  font-size: 12px;
  color: var(--app-muted, #6b7280);
  margin-bottom: 4px;
}
.price {
  font-weight: 700;
  color: var(--ion-color-primary, #c26b2d);
  margin-bottom: 12px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.action-buttons ion-button {
  flex: 1;
  --border-radius: 12px;
  height: 32px;
  font-size: 12px;
}

/* Modal Styles */
.product-modal::part(content) {
  --background: var(--ion-background-color, #f5f7fb);
}

.form-item {
  --padding-start: 0;
  --padding-end: 0;
  --inner-padding-end: 0;
  margin-bottom: 20px;
  border: 1px solid var(--ion-border-color, #edf0f5);
  border-radius: 12px;
  --border-radius: 12px;
  background: var(--app-panel);
}

.upload-section {
  margin: 24px 0;
  padding: 16px;
  background: var(--app-panel-2);
  border-radius: 12px;
  border-left: 4px solid var(--ion-color-primary, #c26b2d);
}

.upload-label { 
  display: block; 
  margin-bottom: 12px; 
  font-size: 14px; 
  font-weight: 600;
  color: var(--app-text-color, #1f2937);
}

.file-input-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}

.file-input {
  display: none;
}

.file-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: var(--ion-color-primary, #c26b2d);
  color: white;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  width: 100%;
}

.file-label:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.preview-box { 
  margin-top: 20px; 
  padding: 16px;
  background: var(--app-panel-2);
  border-radius: 12px;
  text-align: center;
}

.preview-title {
  font-size: 12px;
  color: var(--app-muted, #6b7280);
  margin-bottom: 12px;
}

.preview-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 12px;
}

.info-box {
  margin: 20px 0;
  padding: 12px 16px;
  background: var(--app-info-bg, rgba(59, 130, 246, 0.1));
  border-left: 4px solid var(--ion-color-primary, #c26b2d);
  border-radius: 8px;
  font-size: 13px;
}

.info-box p {
  margin: 0 0 8px 0;
  color: var(--app-text-color, #1f2937);
}

.info-box ul {
  margin: 0;
  padding-left: 20px;
  color: var(--app-muted, #6b7280);
}

.info-box li {
  margin: 4px 0;
  font-size: 12px;
}

.save-btn {
  --border-radius: 12px;
  margin-top: 12px;
}

.confirm-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 16px;
}

.confirm-placeholder {
  width: 100px;
  height: 100px;
  font-size: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.confirm-text {
  text-align: center;
  margin: 16px 0;
  font-size: 14px;
}

.add-product-btn {
  --border-radius: 14px;
  margin: 16px 0;
  font-weight: 600;
  font-size: 16px;
  --padding-start: 20px;
  --padding-end: 20px;
  height: 48px;
  box-shadow: 0 4px 12px rgba(194, 107, 45, 0.2);
  transition: all 0.3s ease;
}

.add-product-btn:hover {
  box-shadow: 0 6px 16px rgba(194, 107, 45, 0.3);
  transform: translateY(-2px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-shell {
    padding: 12px;
  }

  .panel {
    padding: 14px;
    border-radius: 16px;
  }

  .category-segment {
    margin-bottom: 14px;
  }

  .product-image-wrap {
    height: 100px;
  }

  .category {
    font-size: 11px;
  }

  .price {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .page-header ion-toolbar {
    padding: 0 8px;
  }

  .page-shell {
    padding: 8px;
  }

  .panel {
    padding: 12px;
    border-radius: 14px;
  }

  .category-segment {
    margin-bottom: 12px;
    font-size: 12px;
  }

  .category-segment ion-segment-button {
    font-size: 11px;
  }

  .product-image-wrap {
    height: 90px;
  }

  .product-placeholder {
    font-size: 32px;
  }

  .product-card {
    border-radius: 14px;
  }

  ion-card-header {
    padding: 10px;
  }

  ion-card-content {
    padding: 10px;
  }

  .category {
    font-size: 10px;
  }

  .price {
    font-size: 13px;
  }

  .upload-label {
    font-size: 13px;
  }

  .preview-image {
    width: 80px;
    height: 80px;
    border-radius: 12px;
  }
}

@media (max-width: 360px) {
  .page-shell {
    padding: 6px;
  }

  .panel {
    padding: 10px;
  }

  .product-image-wrap {
    height: 80px;
  }

  .category-segment ion-segment-button {
    font-size: 10px;
  }
}
</style>
