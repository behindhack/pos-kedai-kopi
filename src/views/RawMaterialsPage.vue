<template>
  <ion-page>
    <ion-header class="page-header">
      <ion-toolbar>
        <div class="toolbar-inner">
          <div class="brand-box">
            <div class="brand-logo">🔧</div>
            <div>
              <h1>Stock Bahan Baku</h1>
              <p>Manajemen Inventori Bahan Baku</p>
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
          <!-- Statistics Section -->
          <div class="stats-section">
            <div class="stat-card">
              <div class="stat-label">Total Bahan Baku</div>
              <div class="stat-value">{{ materials.length }}</div>
            </div>
            <div class="stat-card alert" v-if="lowStockMaterials.length > 0">
              <div class="stat-label">⚠️ Stok Rendah</div>
              <div class="stat-value">{{ lowStockMaterials.length }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Nilai Inventori</div>
              <div class="stat-value">{{ formatCurrency(totalInventoryValue) }}</div>
            </div>
          </div>

          <!-- Filter and Search Section -->
          <div class="filter-section">
            <div class="search-filter">
              <ion-item class="search-box" lines="none">
                <ion-icon :icon="searchOutline" slot="start"></ion-icon>
                <ion-input 
                  v-model="searchQuery"
                  placeholder="Cari bahan baku..."
                  clearInput
                ></ion-input>
              </ion-item>
            </div>

            <div class="category-filter">
              <button 
                v-for="cat in categoryOptions" 
                :key="cat.value"
                :class="['filter-btn', { active: selectedCategory === cat.value }]"
                @click="selectedCategory = cat.value"
              >
                {{ cat.label }}
              </button>
            </div>
          </div>

          <!-- Add New Material Button -->
          <div class="action-buttons">
            <ion-button expand="block" @click="openAddModal">
              <ion-icon slot="start" :icon="addOutline"></ion-icon>
              Tambah Bahan Baku
            </ion-button>
          </div>

          <!-- Materials List -->
          <div class="materials-list">
            <div v-if="filteredMaterials.length > 0" class="materials-grid">
              <div 
                v-for="material in filteredMaterials"
                :key="material.id"
                :class="['material-card', { 'low-stock': material.quantity <= material.minQuantity }]"
              >
                <div class="card-header">
                  <div class="material-name">{{ material.name }}</div>
                  <div class="category-badge">{{ getCategoryLabel(material.category) }}</div>
                </div>

                <div class="card-body">
                  <div class="info-row">
                    <span class="label">Stok Saat Ini:</span>
                    <span class="value">{{ material.quantity }} {{ material.unit }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Stok Minimum:</span>
                    <span class="value">{{ material.minQuantity }} {{ material.unit }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Harga Satuan:</span>
                    <span class="value">{{ formatCurrency(material.costPerUnit) }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Total Nilai:</span>
                    <span class="value highlight">{{ formatCurrency(material.totalCost) }}</span>
                  </div>
                  <div v-if="material.supplier" class="info-row">
                    <span class="label">Supplier:</span>
                    <span class="value">{{ material.supplier }}</span>
                  </div>

                  <div v-if="material.quantity <= material.minQuantity" class="alert-message">
                    ⚠️ Stok di bawah minimum!
                  </div>
                </div>

                <div class="card-actions">
                  <ion-button size="small" fill="outline" @click="openEditModal(material)">
                    <ion-icon slot="start" :icon="pencilOutline"></ion-icon>
                    Edit
                  </ion-button>
                  <ion-button size="small" fill="outline" @click="openStockModal(material)">
                    <ion-icon slot="start" :icon="refreshOutline"></ion-icon>
                    Update Stok
                  </ion-button>
                  <ion-button size="small" fill="outline" color="danger" @click="confirmDelete(material.id)">
                    <ion-icon slot="start" :icon="trashOutline"></ion-icon>
                    Hapus
                  </ion-button>
                </div>
              </div>
            </div>
            <div v-else class="empty-message">
              <p>📭 Tidak ada bahan baku yang ditampilkan</p>
            </div>
          </div>
        </div>
      </div>
    </ion-content>

    <!-- Add/Edit Modal -->
    <ion-modal 
      :is-open="isModalOpen"
      @didDismiss="isModalOpen = false"
      class="material-modal"
    >
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button @click="isModalOpen = false">Tutup</ion-button>
          </ion-buttons>
          <ion-title>{{ editingMaterial ? 'Edit Bahan Baku' : 'Tambah Bahan Baku' }}</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="modal-content">
        <div class="form-group">
          <ion-label>Nama Bahan Baku</ion-label>
          <ion-input 
            v-model="formData.name"
            placeholder="Masukkan nama bahan baku"
          ></ion-input>
        </div>

        <div class="form-group">
          <ion-label>Kategori</ion-label>
          <ion-select v-model="formData.category">
            <ion-select-option value="COFFEE_BEAN">Biji Kopi</ion-select-option>
            <ion-select-option value="INGREDIENT">Bahan Pokok</ion-select-option>
            <ion-select-option value="PACKAGING">Kemasan</ion-select-option>
            <ion-select-option value="OTHER">Lainnya</ion-select-option>
          </ion-select>
        </div>

        <div class="form-group">
          <ion-label>Unit Satuan</ion-label>
          <ion-input 
            v-model="formData.unit"
            placeholder="Contoh: kg, g, liter, pcs"
          ></ion-input>
        </div>

        <div class="form-row">
          <div class="form-group">
            <ion-label>Kuantitas</ion-label>
            <ion-input 
              v-model.number="formData.quantity"
              type="number"
              placeholder="0"
            ></ion-input>
          </div>

          <div class="form-group">
            <ion-label>Stok Minimum</ion-label>
            <ion-input 
              v-model.number="formData.minQuantity"
              type="number"
              placeholder="0"
            ></ion-input>
          </div>
        </div>

        <div class="form-group">
          <ion-label>Harga Satuan (Rp)</ion-label>
          <ion-input 
            v-model.number="formData.costPerUnit"
            type="number"
            placeholder="0"
          ></ion-input>
        </div>

        <div class="form-group">
          <ion-label>Supplier (Opsional)</ion-label>
          <ion-input 
            v-model="formData.supplier"
            placeholder="Nama supplier"
          ></ion-input>
        </div>

        <div class="form-total">
          <span>Total Nilai:</span>
          <span class="highlight">{{ formatCurrency((formData.quantity || 0) * (formData.costPerUnit || 0)) }}</span>
        </div>

        <div class="modal-actions">
          <ion-button expand="block" @click="isModalOpen = false" fill="outline">
            Batal
          </ion-button>
          <ion-button expand="block" @click="saveMaterial">
            <ion-icon slot="start" :icon="saveOutline"></ion-icon>
            Simpan
          </ion-button>
        </div>
      </ion-content>
    </ion-modal>

    <!-- Update Stock Modal -->
    <ion-modal 
      :is-open="isStockModalOpen"
      @didDismiss="isStockModalOpen = false"
      class="stock-modal"
    >
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button @click="isStockModalOpen = false">Tutup</ion-button>
          </ion-buttons>
          <ion-title>Update Stok</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="modal-content">
        <div v-if="selectedMaterial" class="stock-form">
          <div class="material-info">
            <h3>{{ selectedMaterial.name }}</h3>
            <p>Stok saat ini: {{ selectedMaterial.quantity }} {{ selectedMaterial.unit }}</p>
          </div>

          <div class="form-group">
            <ion-label>Stok Baru</ion-label>
            <ion-input 
              v-model.number="newStockQuantity"
              type="number"
              placeholder="Masukkan jumlah stok baru"
            ></ion-input>
          </div>

          <div class="modal-actions">
            <ion-button expand="block" @click="isStockModalOpen = false" fill="outline">
              Batal
            </ion-button>
            <ion-button expand="block" @click="updateStock">
              <ion-icon slot="start" :icon="checkmarkOutline"></ion-icon>
              Perbarui
            </ion-button>
          </div>
        </div>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonModal,
  IonButtons,
  IonTitle,
  alertController,
} from '@ionic/vue';
import {
  addOutline,
  searchOutline,
  pencilOutline,
  trashOutline,
  refreshOutline,
  moonOutline,
  sunnyOutline,
  saveOutline,
  checkmarkOutline,
} from 'ionicons/icons';
import { ref, computed } from 'vue';
import { useRawMaterialsStore } from '../stores/rawMaterials';
import { useTheme } from '../composables/useTheme';
import type { RawMaterial } from '../types';

const { isDark, toggleTheme } = useTheme();
const rawMaterialsStore = useRawMaterialsStore();

const searchQuery = ref('');
const selectedCategory = ref('ALL');
const isModalOpen = ref(false);
const isStockModalOpen = ref(false);
const editingMaterial = ref<RawMaterial | null>(null);
const selectedMaterial = ref<RawMaterial | null>(null);
const newStockQuantity = ref<number>(0);

const formData = ref({
  name: '',
  category: 'INGREDIENT' as any,
  unit: '',
  quantity: 0,
  minQuantity: 0,
  costPerUnit: 0,
  supplier: '',
});

const categoryOptions = [
  { value: 'ALL', label: 'Semua' },
  { value: 'COFFEE_BEAN', label: 'Biji Kopi' },
  { value: 'INGREDIENT', label: 'Bahan Pokok' },
  { value: 'PACKAGING', label: 'Kemasan' },
  { value: 'OTHER', label: 'Lainnya' },
];

const materials = computed(() => rawMaterialsStore.activeMaterials);
const lowStockMaterials = computed(() => rawMaterialsStore.lowStockMaterials);
const totalInventoryValue = computed(() => rawMaterialsStore.getTotalInventoryValue);

const filteredMaterials = computed(() => {
  let result = materials.value;

  if (selectedCategory.value !== 'ALL') {
    result = result.filter(m => m.category === selectedCategory.value);
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(m => 
      m.name.toLowerCase().includes(query) || 
      (m.supplier?.toLowerCase().includes(query) || false)
    );
  }

  return result;
});

const getCategoryLabel = (category: string) => {
  const option = categoryOptions.find(o => o.value === category);
  return option?.label || category;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

const openAddModal = () => {
  editingMaterial.value = null;
  formData.value = {
    name: '',
    category: 'INGREDIENT',
    unit: '',
    quantity: 0,
    minQuantity: 0,
    costPerUnit: 0,
    supplier: '',
  };
  isModalOpen.value = true;
};

const openEditModal = (material: RawMaterial) => {
  editingMaterial.value = material;
  formData.value = {
    name: material.name,
    category: material.category,
    unit: material.unit,
    quantity: material.quantity,
    minQuantity: material.minQuantity,
    costPerUnit: material.costPerUnit,
    supplier: material.supplier || '',
  };
  isModalOpen.value = true;
};

const openStockModal = (material: RawMaterial) => {
  selectedMaterial.value = material;
  newStockQuantity.value = material.quantity;
  isStockModalOpen.value = true;
};

const saveMaterial = async () => {
  if (!formData.value.name || !formData.value.unit || formData.value.costPerUnit === undefined) {
    const alert = await alertController.create({
      header: 'Validasi',
      message: 'Mohon isi semua field yang diperlukan',
      buttons: ['OK'],
    });
    await alert.present();
    return;
  }

  if (editingMaterial.value) {
    await rawMaterialsStore.updateRawMaterial(editingMaterial.value.id, formData.value);
  } else {
    await rawMaterialsStore.createRawMaterial({
      ...formData.value,
      isActive: true,
      totalCost: formData.value.quantity * formData.value.costPerUnit,
    } as any);
  }

  isModalOpen.value = false;
};

const updateStock = async () => {
  if (selectedMaterial.value) {
    await rawMaterialsStore.updateRawMaterialStock(selectedMaterial.value.id, newStockQuantity.value);
    isStockModalOpen.value = false;
  }
};

const confirmDelete = async (id: string) => {
  const alert = await alertController.create({
    header: 'Konfirmasi Hapus',
    message: 'Apakah Anda yakin ingin menghapus bahan baku ini?',
    buttons: [
      { text: 'Batal', role: 'cancel' },
      {
        text: 'Hapus',
        role: 'destructive',
        handler: () => {
          rawMaterialsStore.deleteRawMaterial(id);
        },
      },
    ],
  });
  await alert.present();
};

// Load data on mount
rawMaterialsStore.loadRawMaterials('store-1');
rawMaterialsStore.loadLowStockMaterials('store-1');
rawMaterialsStore.loadTotalCost('store-1');
</script>

<style scoped>
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.toolbar-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  width: 100%;
}

.brand-box {
  display: flex;
  gap: 12px;
  align-items: center;
  color: white;
  flex: 1;
}

.brand-logo {
  font-size: 28px;
}

.brand-box h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.brand-box p {
  margin: 0;
  font-size: 12px;
  opacity: 0.9;
}

.theme-btn {
  --color: white;
}

.page-content {
  --background: linear-gradient(to bottom, #f8f9fa, #ffffff);
}

.page-shell {
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Statistics Section */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

.stat-card.alert {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-label {
  font-size: 12px;
  opacity: 0.9;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  margin-top: 8px;
}

/* Filter Section */
.filter-section {
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.search-filter {
  margin-bottom: 12px;
}

.search-box {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 0 12px;
}

.category-filter {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.filter-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

/* Action Buttons */
.action-buttons {
  padding: 16px;
  border-bottom: 1px solid #eee;
}

/* Materials List */
.materials-list {
  padding: 16px;
}

.materials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.material-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  transition: all 0.3s;
}

.material-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.material-card.low-stock {
  border-left: 4px solid #f5576c;
}

.card-header {
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.material-name {
  font-weight: 600;
  flex: 1;
}

.category-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
}

.card-body {
  padding: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
}

.info-row .label {
  color: #666;
  font-weight: 500;
}

.info-row .value {
  font-weight: 600;
  color: #333;
}

.info-row .value.highlight {
  color: #667eea;
}

.alert-message {
  margin-top: 8px;
  padding: 8px;
  background: #fff3cd;
  border-left: 3px solid #ffc107;
  color: #856404;
  font-size: 12px;
  border-radius: 4px;
}

.card-actions {
  padding: 8px 12px;
  display: flex;
  gap: 4px;
  border-top: 1px solid #eee;
}

.card-actions ion-button {
  flex: 1;
  height: 32px;
  --padding-start: 4px;
  --padding-end: 4px;
  font-size: 12px;
}

.empty-message {
  text-align: center;
  padding: 40px 16px;
  color: #999;
}

/* Modal */
.modal-content {
  padding: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group ion-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group ion-input,
.form-group ion-select {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px 12px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-total {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 6px;
  margin-bottom: 16px;
  font-weight: 600;
}

.form-total .highlight {
  color: #667eea;
}

.modal-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 20px;
}

.stock-form .material-info {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.stock-form .material-info h3 {
  margin: 0 0 8px 0;
  color: #333;
}

.stock-form .material-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}
</style>
