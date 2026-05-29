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
            <ion-icon :icon="addCircleOutline" slot="start"></ion-icon>
            Tambah Produk Baru
          </ion-button>

          <ion-grid class="product-grid">
            <ion-row>
              <ion-col size="6" size-md="4" size-xl="3" v-for="p in filteredProducts" :key="p.id">
                <ion-card class="product-card">
                  <div class="product-image-wrap">
                    <img v-if="p.image" :src="p.image" alt="Gambar produk" class="product-image" />
                    <div v-else class="product-placeholder">
                      <ion-icon :icon="cafeOutline"></ion-icon>
                    </div>
                  </div>
                  <ion-card-header>
                    <ion-card-title>{{ p.name }}</ion-card-title>
                  </ion-card-header>
                  <ion-card-content>
                    <p class="category">{{ formatCategory(p.category) }}</p>
                    <p class="price">{{ formatCurrency(p.basePrice) }}</p>
                    <div class="action-buttons">
                      <ion-button size="small" fill="outline" @click="editProduct(p)">
                        <ion-icon :icon="createOutline" slot="start"></ion-icon>
                        Edit
                      </ion-button>
                      <ion-button size="small" fill="outline" color="danger" @click="confirmDelete(p)">
                        <ion-icon :icon="trashOutline" slot="start"></ion-icon>
                        Hapus
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
              <ion-title>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <ion-icon :icon="editingProduct ? createOutline : addCircleOutline"></ion-icon>
                  <span>{{ editingProduct ? 'Edit Produk' : 'Tambah Produk Baru' }}</span>
                </div>
              </ion-title>
              <ion-buttons slot="end">
                <ion-button @click="closeModal">
                  <ion-icon :icon="closeOutline" slot="icon-only"></ion-icon>
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>

          <ion-content class="ion-padding">
            <!-- Nama Produk -->
            <ion-item class="form-item">
              <ion-label position="stacked">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <ion-icon :icon="pricetagOutline"></ion-icon>
                  Nama Produk
                </div>
              </ion-label>
              <ion-input 
                v-model="form.name" 
                placeholder="Masukkan nama produk"
                clearInput
              />
            </ion-item>

            <!-- Kategori -->
            <ion-item class="form-item">
              <ion-label position="stacked">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <ion-icon :icon="cafeOutline"></ion-icon>
                  Kategori
                </div>
              </ion-label>
              <ion-select v-model="form.category" placeholder="Pilih kategori">
                <ion-select-option value="ESPRESSO">Espresso Based</ion-select-option>
                <ion-select-option value="MANUAL_BREW">Manual Brew</ion-select-option>
                <ion-select-option value="NON_COFFEE">Non Coffee</ion-select-option>
                <ion-select-option value="FOOD">Food / Pastry</ion-select-option>
              </ion-select>
            </ion-item>

            <!-- Harga Dasar -->
            <ion-item class="form-item">
              <ion-label position="stacked">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <ion-icon :icon="cashOutline"></ion-icon>
                  Harga Dasar (Rp)
                </div>
              </ion-label>
              <ion-input 
                v-model.number="form.basePrice" 
                type="number" 
                placeholder="Contoh: 25000"
                inputmode="decimal"
              />
            </ion-item>

            <!-- Upload Gambar -->
            <div class="upload-section">
              <label class="upload-label">
                <ion-icon :icon="imageOutline" style="vertical-align: middle; margin-right: 6px;"></ion-icon>
                Upload Gambar Produk
              </label>
              <div class="file-input-wrapper">
                <input 
                  type="file" 
                  accept="image/*" 
                  @change="handleImageUpload"
                  id="product-image-input"
                  class="file-input"
                />
                <label for="product-image-input" class="file-label">
                  <ion-icon :icon="imageOutline" style="font-size: 1.2rem;"></ion-icon>
                  Pilih Gambar (JPG, PNG, GIF)
                </label>
              </div>
            </div>

            <!-- Preview Gambar -->
            <div v-if="form.image" class="preview-box">
              <p class="preview-title">Preview Gambar:</p>
              <img :src="form.image" alt="Preview produk" class="preview-image" />
              <ion-button size="small" fill="clear" color="danger" @click="form.image = ''">
                <ion-icon :icon="trashOutline" slot="start"></ion-icon>
                Hapus Gambar
              </ion-button>
            </div>

            <!-- Resep / Bahan Baku -->
            <div class="recipe-section">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <label class="upload-label" style="margin-bottom: 0;">
                  <ion-icon :icon="cubeOutline" style="vertical-align: middle; margin-right: 6px;"></ion-icon>
                  Resep Bahan Baku (Opsional)
                </label>
                <ion-button size="small" fill="outline" @click="addRecipeItem">
                  <ion-icon :icon="addOutline" slot="start"></ion-icon>
                  Tambah Bahan
                </ion-button>
              </div>

              <div v-for="(item, index) in form.recipe" :key="index" class="recipe-item-row">
                <ion-item class="form-item recipe-select-item" lines="none">
                  <ion-select v-model="item.materialId" placeholder="Pilih Bahan" interface="popover">
                    <ion-select-option v-for="rm in rawMaterialsStore.activeMaterials" :key="rm.id" :value="rm.id">
                      {{ rm.name }} ({{ formatCurrency(rm.costPerUnit) }}/{{ rm.unit }})
                    </ion-select-option>
                  </ion-select>
                </ion-item>
                
                <ion-item class="form-item recipe-qty-item" lines="none">
                  <ion-input
                    v-model.number="item.quantity"
                    type="number"
                    placeholder="Jumlah"
                  />
                </ion-item>
                
                <ion-button fill="clear" color="danger" class="recipe-remove-btn" @click="removeRecipeItem(index)">
                  <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
                </ion-button>
              </div>
              <p v-if="form.recipe.length === 0" class="empty-recipe">
                Tidak ada bahan baku. (Stok produk akan dipotong langsung saat terjual)
              </p>
            </div>

            <!-- Analisis Keuntungan -->
            <div v-if="form.recipe.length > 0" class="profit-analysis-box">
              <h4 style="margin: 0 0 12px 0; font-size: 0.95rem; font-weight: 600; color: var(--ion-text-color);">Analisis Keuntungan per Item</h4>
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span style="color: var(--app-muted);">Harga Jual:</span>
                <strong>{{ formatCurrency(form.basePrice || 0) }}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: var(--ion-color-danger);">
                <span>Total Harga Pokok (HPP):</span>
                <strong>- {{ formatCurrency(recipeTotalCost) }}</strong>
              </div>
              <div style="border-top: 1px dashed var(--ion-border-color); margin: 8px 0;"></div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: var(--ion-color-success);">
                <span>Estimasi Keuntungan:</span>
                <strong>{{ formatCurrency(estimatedProfit) }}</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--app-muted);">Margin Keuntungan:</span>
                <strong :style="{ color: estimatedMargin > 0 ? 'var(--ion-color-success)' : 'var(--ion-color-danger)' }">
                  {{ estimatedMargin.toFixed(1) }}%
                </strong>
              </div>
            </div>

            <!-- Info -->
            <div class="info-box">
              <p style="display: flex; align-items: center; gap: 6px;">
                <ion-icon :icon="informationCircleOutline" style="font-size: 1.2rem;"></ion-icon>
                <strong>Info:</strong>
              </p>
              <ul>
                <li>Nama dan kategori harus diisi</li>
                <li>Gambar akan di-resize otomatis ke 250x250px</li>
                <li>Format: JPG, PNG, GIF, atau WebP (maks 2MB)</li>
              </ul>
            </div>

            <!-- Action Buttons -->
            <ion-button expand="block" fill="solid" color="primary" class="save-btn" @click="saveProduct">
              <ion-icon :icon="saveOutline" slot="start"></ion-icon>
              Simpan Produk
            </ion-button>

            <ion-button expand="block" fill="outline" @click="closeModal" class="cancel-btn">
              <ion-icon :icon="closeOutline" slot="start"></ion-icon>
              Batal
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
              <div v-else class="confirm-placeholder">
                <ion-icon :icon="cafeOutline"></ion-icon>
              </div>
            </ion-item>
            <p class="confirm-text">
              Apakah Anda yakin ingin menghapus produk <strong>{{ productToDelete?.name }}</strong>?
            </p>
            <ion-button expand="block" fill="solid" color="danger" @click="confirmDeleteAction">
              <ion-icon :icon="trashOutline" slot="start"></ion-icon>
              Hapus Produk
            </ion-button>
            <ion-button expand="block" fill="outline" @click="closeDeleteConfirm">
              <ion-icon :icon="closeOutline" slot="start"></ion-icon>
              Batal
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
import type { Product, RecipeItem } from '../types';
import { useRawMaterialsStore } from '../stores/rawMaterials';
import { sunnyOutline, moonOutline, addCircleOutline, pricetagOutline, cafeOutline, cashOutline, imageOutline, closeOutline, saveOutline, createOutline, informationCircleOutline, trashOutline, cubeOutline, addOutline } from 'ionicons/icons';

const productStore = useProductStore();
const rawMaterialsStore = useRawMaterialsStore();
const { isDark, toggleTheme } = useTheme();
const selectedCategory = ref<'ALL' | Product['category']>('ALL');
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref<string | null>(null);
const showDeleteConfirm = ref(false);
const editingProduct = ref<Product | null>(null);
const productToDelete = ref<Product | null>(null);

const form = ref<{
  id?: string;
  name: string;
  category: Product['category'] | '';
  basePrice: number;
  image: string;
  recipe: { materialId: string; quantity: number }[];
}>({
  name: '',
  category: '',
  basePrice: 0,
  image: '',
  recipe: [],
});

// Profit Analysis Computeds
const recipeTotalCost = computed(() => {
  return form.value.recipe.reduce((total, item) => {
    const rawMaterial = rawMaterialsStore.activeMaterials.find(rm => rm.id === item.materialId || rm.id === Number(item.materialId));
    if (rawMaterial && item.quantity) {
      return total + (Number(rawMaterial.costPerUnit) * Number(item.quantity));
    }
    return total;
  }, 0);
});

const estimatedProfit = computed(() => {
  return (form.value.basePrice || 0) - recipeTotalCost.value;
});

const estimatedMargin = computed(() => {
  if (!form.value.basePrice || form.value.basePrice <= 0) return 0;
  return (estimatedProfit.value / form.value.basePrice) * 100;
});

onMounted(() => {
  productStore.loadFromStorage();
  // We use dummy 'default' since multi-tenant is not fully setup
  rawMaterialsStore.loadRawMaterials('default');
});

const filteredProducts = computed(() => {
  if (selectedCategory.value === 'ALL') return productStore.products;
  return productStore.products.filter((p) => p.category === selectedCategory.value);
});

const openAddModal = () => {
  editingProduct.value = null;
  form.value = { name: '', category: '' as any, basePrice: 0, image: '', recipe: [] };
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
    recipe: p.recipe ? JSON.parse(JSON.stringify(p.recipe)) : [],
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingProduct.value = null;
  form.value = { name: '', category: '' as any, basePrice: 0, image: '', recipe: [] };
};

const addRecipeItem = () => {
  form.value.recipe.push({ materialId: '', quantity: 1 });
};

const removeRecipeItem = (index: number) => {
  form.value.recipe.splice(index, 1);
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
  
  // Filter empty materialIds just in case
  const validRecipe = form.value.recipe.filter(r => r.materialId && r.quantity > 0);

  if (editingProduct.value) {
    productStore.updateProduct(form.value.id!, { 
      id: form.value.id!, 
      name: form.value.name, 
      category: form.value.category as Product['category'], 
      basePrice: form.value.basePrice, 
      image: form.value.image, 
      recipe: validRecipe,
      isActive: true 
    });
    toast.message = 'Produk diperbarui';
  } else {
    productStore.addProduct({ 
      id: Date.now().toString(), 
      name: form.value.name, 
      category: form.value.category as Product['category'], 
      basePrice: form.value.basePrice, 
      image: form.value.image, 
      recipe: validRecipe,
      isActive: true 
    });
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

/* Modal Styles - Modern Design */
.product-modal {
  --background: var(--ion-background-color, #f8f9fa);
}

.product-modal::part(content) {
  --background: var(--ion-background-color, #f8f9fa);
  border-radius: 24px 24px 0 0;
}

.product-modal ion-header {
  --background: transparent;
  --border-bottom: none;
  padding: 16px 0;
}

.product-modal ion-toolbar {
  --background: transparent;
  --border-bottom: 1px solid var(--ion-border-color);
  --padding-top: 12px;
  --padding-bottom: 12px;
  --padding-start: 16px;
  --padding-end: 16px;
}

.product-modal ion-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--ion-text-color);
  letter-spacing: -0.5px;
}

.product-modal ion-content {
  --padding-top: 24px;
  --padding-bottom: 24px;
  --padding-start: 16px;
  --padding-end: 16px;
  --background: var(--ion-background-color);
}

/* Form Item - Modern */
.form-item {
  --padding-start: 0;
  --padding-end: 0;
  --inner-padding-start: 14px;
  --inner-padding-end: 14px;
  --inner-padding-top: 14px;
  --inner-padding-bottom: 14px;
  margin-bottom: 18px;
  border: 1.5px solid var(--ion-border-color);
  border-radius: 12px;
  --border-radius: 12px;
  background: var(--app-input-bg);
  --background: var(--app-input-bg);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.form-item:hover {
  border-color: var(--ion-border-color);
  box-shadow: var(--app-shadow-sm);
  transform: translateY(-1px);
}

.form-item:focus-within {
  border-color: var(--ion-color-primary);
  border: 1.5px solid var(--ion-color-primary);
  box-shadow: 0 0 0 4px var(--app-info-bg), var(--app-shadow-sm);
}

.form-item ion-label {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--ion-text-color);
  margin-bottom: 4px;
}

/* Upload Section - Modern */
.upload-section {
  margin: 28px 0;
  padding: 20px;
  background: linear-gradient(135deg, var(--app-panel-2) 0%, var(--app-input-bg) 100%);
  border-radius: 14px;
  border: 1.5px solid var(--ion-border-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.upload-section:hover {
  border-color: var(--ion-color-primary);
  box-shadow: var(--app-shadow-sm);
  background: linear-gradient(135deg, var(--app-input-bg) 0%, var(--app-panel-2) 100%);
}

.upload-label { 
  display: block; 
  margin-bottom: 14px; 
  font-size: 0.95rem; 
  font-weight: 600;
  color: var(--ion-text-color);
  letter-spacing: -0.3px;
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
  gap: 10px;
  padding: 16px 14px;
  background: linear-gradient(135deg, var(--ion-color-primary) 0%, rgba(217, 119, 6, 0.85) 100%);
  color: white;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  border: 1.5px solid var(--ion-color-primary);
  box-shadow: 0 4px 12px rgba(217, 119, 6, 0.2);
}

.file-label:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(217, 119, 6, 0.3);
  border-color: rgba(217, 119, 6, 0.6);
}

.file-label:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(217, 119, 6, 0.2);
}

/* Preview Box - Modern */
.preview-box { 
  margin: 24px 0;
  padding: 20px;
  background: linear-gradient(135deg, var(--app-panel) 0%, var(--app-input-bg) 100%);
  border-radius: 14px;
  border: 1.5px solid var(--ion-border-color);
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.preview-title {
  font-size: 0.85rem;
  color: var(--app-muted);
  margin-bottom: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-image {
  width: 140px;
  height: 140px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  margin: 0 auto 16px;
  border: 2px solid var(--ion-border-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.preview-image:hover {
  transform: scale(1.02);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.16);
}

.preview-box ion-button {
  --border-radius: 8px;
  --padding-start: 12px;
  --padding-end: 12px;
  height: 36px;
  font-size: 0.85rem;
  font-weight: 600;
}

/* Info Box - Modern */
.info-box {
  margin: 24px 0;
  padding: 16px 18px;
  background: linear-gradient(135deg, var(--app-info-bg) 0%, rgba(14, 165, 233, 0.05) 100%);
  border-left: 3px solid var(--ion-color-primary);
  border-radius: 10px;
  font-size: 0.9rem;
  border: 1px solid rgba(14, 165, 233, 0.2);
}

.info-box p {
  margin: 0 0 10px 0;
  color: var(--ion-text-color);
  font-weight: 600;
  font-size: 0.95rem;
}

.info-box ul {
  margin: 0;
  padding-left: 22px;
  color: var(--app-muted);
}

.info-box li {
  margin: 6px 0;
  font-size: 0.85rem;
  line-height: 1.5;
  font-weight: 500;
}

/* Recipe Section */
.recipe-section {
  margin: 24px 0;
  padding: 16px;
  background: var(--app-panel-2);
  border: 1.5px solid var(--ion-border-color);
  border-radius: 14px;
}

.recipe-item-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.recipe-select-item {
  flex: 2;
  margin-bottom: 0;
}

.recipe-qty-item {
  flex: 1;
  margin-bottom: 0;
}

.recipe-remove-btn {
  --padding-start: 4px;
  --padding-end: 4px;
  margin: 0;
}

.empty-recipe {
  font-size: 0.85rem;
  color: var(--app-muted);
  font-style: italic;
  margin-top: 8px;
}

/* Profit Analysis Box */
.profit-analysis-box {
  margin: 0 0 24px 0;
  padding: 16px;
  background: var(--app-input-bg);
  border: 1.5px solid var(--ion-border-color);
  border-radius: 14px;
  font-size: 0.95rem;
}

/* Action Buttons - Modern */
.save-btn {
  --border-radius: 12px;
  --padding-top: 14px;
  --padding-bottom: 14px;
  --padding-start: 16px;
  --padding-end: 16px;
  height: 52px;
  margin-top: 20px;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.3px;
  --background: linear-gradient(135deg, var(--ion-color-primary) 0%, rgba(217, 119, 6, 0.85) 100%);
  box-shadow: 0 6px 18px rgba(217, 119, 6, 0.25);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.save-btn:hover {
  box-shadow: 0 8px 24px rgba(217, 119, 6, 0.35);
  transform: translateY(-2px);
}

.product-modal ion-button[fill="outline"] {
  --border-radius: 10px;
  --padding-top: 12px;
  --padding-bottom: 12px;
  --border-width: 1.5px;
  border-color: var(--ion-border-color);
  height: 44px;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-modal ion-button[fill="outline"]:hover {
  border-color: var(--ion-color-primary);
  color: var(--ion-color-primary);
  background: rgba(217, 119, 6, 0.05);
}

.confirm-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
  margin: 16px auto;
  display: block;
  border: 2px solid var(--ion-border-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.confirm-placeholder {
  width: 120px;
  height: 120px;
  font-size: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px auto;
  background: var(--app-input-bg);
  border-radius: 12px;
  border: 2px dashed var(--ion-border-color);
}

.confirm-text {
  text-align: center;
  margin: 20px 0 24px;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--ion-text-color);
}

.confirm-text strong {
  color: var(--ion-color-primary);
  font-weight: 700;
}

.add-product-btn {
  --border-radius: 12px;
  margin: 20px 0;
  font-weight: 700;
  font-size: 1rem;
  --padding-start: 24px;
  --padding-end: 24px;
  height: 52px;
  --background: linear-gradient(135deg, var(--ion-color-primary) 0%, rgba(217, 119, 6, 0.85) 100%);
  box-shadow: 0 6px 18px rgba(217, 119, 6, 0.25);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.3px;
}

.add-product-btn:hover {
  box-shadow: 0 8px 24px rgba(217, 119, 6, 0.35);
  transform: translateY(-2px);
}

.add-product-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(217, 119, 6, 0.15);
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
