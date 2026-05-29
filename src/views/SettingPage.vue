<template>
  <ion-page>
    <ion-header class="page-header">
      <ion-toolbar>
        <div class="toolbar-inner">
          <div class="brand-box">
            <div class="brand-logo">⚙️</div>
            <div>
              <h1>Setting POS</h1>
              <p>Pengaturan tampilan dan transaksi</p>
            </div>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="page-content">
      <div class="page-shell">
        <div class="panel">
          <!-- Pengaturan Kedai -->
          <div class="setting-card">
            <h3>📦 Pengaturan Kedai</h3>

            <ion-item>
              <ion-input
                v-model="shopSettings.shopName"
                label="Nama Usaha"
                label-placement="stacked"
                placeholder="Masukkan nama kedai Anda"
              />
            </ion-item>

            <ion-item>
              <ion-input
                v-model="shopSettings.address"
                label="Alamat (opsional)"
                label-placement="stacked"
                placeholder="Alamat kedai"
              />
            </ion-item>

            <ion-item>
              <ion-input
                v-model="shopSettings.phone"
                label="No. Telepon (opsional)"
                label-placement="stacked"
                placeholder="Nomor telepon"
              />
            </ion-item>

            <div class="logo-section">
              <label><strong>Logo Kedai</strong></label>
              <div class="logo-preview">
                <div class="logo-display" v-if="shopSettings.shopLogo">
                  <img v-if="isImageUrl(shopSettings.shopLogo)" :src="shopSettings.shopLogo" :alt="shopSettings.shopName" class="logo-img" />
                  <span v-else>{{ shopSettings.shopLogo }}</span>
                </div>
                <div v-else class="logo-placeholder">Tidak ada logo</div>
              </div>

              <!-- Format Info -->
              <div class="format-info">
                <strong>Format Logo yang Diizinkan:</strong>
                <ul>
                  <li>📋 Emoji: Langsung ketik emoji (contoh: ☕, 🏪, etc)</li>
                  <li>🖼️ File Gambar: JPG, PNG, GIF, WebP (maks 2MB)</li>
                  <li>🌐 URL: Link langsung ke gambar online</li>
                </ul>
              </div>

              <!-- Tab untuk pilih metode -->
              <ion-segment v-model="logoInputMethod" class="logo-method-segment ion-margin-top">
                <ion-segment-button value="emoji">
                  <ion-label>Emoji</ion-label>
                </ion-segment-button>
                <ion-segment-button value="upload">
                  <ion-label>Upload</ion-label>
                </ion-segment-button>
                <ion-segment-button value="url">
                  <ion-label>URL</ion-label>
                </ion-segment-button>
              </ion-segment>

              <!-- Input Emoji -->
              <div v-if="logoInputMethod === 'emoji'" class="ion-margin-top">
                <ion-item>
                  <ion-input
                    v-model="shopSettings.shopLogo"
                    label="Masukkan Emoji"
                    label-placement="stacked"
                    placeholder="☕ atau emoji lainnya"
                    :maxlength="2"
                  />
                </ion-item>
                <p class="helper-text">Ketik atau paste emoji (maksimal 2 karakter)</p>
              </div>

              <!-- Upload File -->
              <div v-if="logoInputMethod === 'upload'" class="ion-margin-top">
                <div class="upload-area">
                  <input
                    ref="fileInputRef"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    @change="handleFileUpload"
                    class="file-input"
                  />
                  <div class="upload-button-area" @click="triggerFileInput">
                    <ion-icon :icon="cloudUploadOutline" class="upload-icon"></ion-icon>
                    <p><strong>Klik untuk upload logo</strong></p>
                    <p class="upload-hint">atau drag & drop gambar</p>
                  </div>
                </div>
                <p class="helper-text">Format: JPG, PNG, GIF, WebP | Ukuran maksimal: 2MB</p>
                <p v-if="uploadStatus" :class="uploadStatusClass">{{ uploadStatus }}</p>
              </div>

              <!-- Input URL -->
              <div v-if="logoInputMethod === 'url'" class="ion-margin-top">
                <ion-item>
                  <ion-input
                    v-model="logoUrlInput"
                    label="URL Gambar Logo"
                    label-placement="stacked"
                    placeholder="https://example.com/logo.png"
                    @keyup.enter="applyLogoUrl"
                  />
                </ion-item>
                <ion-button expand="block" class="apply-url-btn ion-margin-top" @click="applyLogoUrl">
                  Terapkan URL
                </ion-button>
                <p class="helper-text">Masukkan link lengkap ke gambar (harus accessible dari browser)</p>
              </div>
            </div>

            <ion-button expand="block" class="save-btn ion-margin-top" @click="saveShopSettings">
              Simpan Pengaturan Kedai
            </ion-button>
          </div>

          <!-- Pengaturan Struk Pembayaran -->
          <div class="setting-card">
            <h3>🖨️ Pengaturan Struk Pembayaran</h3>

            <div class="theme-row">
              <div>
                <strong>Tampilkan Logo</strong>
                <p>Tampilkan logo kedai di struk pembayaran</p>
              </div>
              <ion-toggle
                :checked="shopSettings.printSettings.showLogo"
                @ionChange="(e) => shopSettings.printSettings.showLogo = e.detail.checked"
              />
            </div>

            <div class="theme-row">
              <div>
                <strong>Tampilkan Alamat</strong>
                <p>Tampilkan alamat kedai di struk pembayaran</p>
              </div>
              <ion-toggle
                :checked="shopSettings.printSettings.showAddress"
                @ionChange="(e) => shopSettings.printSettings.showAddress = e.detail.checked"
              />
            </div>

            <ion-item>
              <ion-input
                v-model.number="shopSettings.printSettings.paperWidth"
                type="number"
                label="Lebar Kertas (mm)"
                label-placement="stacked"
              />
            </ion-item>

            <ion-button expand="block" class="save-btn ion-margin-top" @click="savePrintSettings">
              Simpan Pengaturan Struk
            </ion-button>
          </div>

          <!-- Pajak & Diskon -->
          <div class="setting-card">
            <h3>💰 Pajak & Diskon</h3>

            <ion-item>
              <ion-input
                v-model.number="tax"
                type="number"
                label="Pajak (%)"
                label-placement="stacked"
              />
            </ion-item>

            <ion-item>
              <ion-input
                v-model.number="discount"
                type="number"
                label="Diskon Default (%)"
                label-placement="stacked"
              />
            </ion-item>

            <ion-button expand="block" class="save-btn ion-margin-top" @click="saveTaxDiscount">
              Simpan Setting
            </ion-button>
          </div>

          <!-- Tampilan Aplikasi -->
          <div class="setting-card">
            <h3>🌙 Tampilan Aplikasi</h3>

            <div class="theme-row">
              <div>
                <strong>Dark Mode POS</strong>
                <p>Aktifkan tampilan gelap untuk area kasir dan dashboard.</p>
              </div>

              <ion-toggle :checked="isDark" @ionChange="toggleTheme" />
            </div>
          </div>

          <!-- Manajemen Staff (Hanya untuk OWNER) -->
          <div v-if="isOwner" class="setting-card">
            <h3>👥 Manajemen Staff</h3>

            <!-- Daftar Staff Saat Ini -->
            <div class="staff-section">
              <h4>Daftar Staff Saat Ini</h4>
              <div v-if="staffList.length === 0" class="empty-state">
                <p>Belum ada staff terdaftar</p>
              </div>
              <div v-else class="staff-list">
                <div v-for="staff in staffList" :key="staff.id" class="staff-item">
                  <div class="staff-info">
                    <div class="staff-name">{{ staff.name }}</div>
                    <div class="staff-details">{{ staff.email }} • <span class="role-badge" :class="staff.role.toLowerCase()">{{ staff.role }}</span></div>
                  </div>
                  <div class="staff-actions">
                    <ion-button fill="clear" size="small" @click="editStaff(staff)">✏️</ion-button>
                    <ion-button fill="clear" size="small" color="danger" @click="deleteStaffConfirm(staff)">🗑️</ion-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Form Tambah/Edit Staff -->
            <div class="staff-form-section">
              <h4>{{ editingStaff ? 'Edit Staff' : 'Tambah Staff Baru' }}</h4>
              
              <ion-item>
                <ion-input
                  v-model="staffForm.name"
                  label="Nama Staff"
                  label-placement="stacked"
                  placeholder="Masukkan nama"
                />
              </ion-item>

              <ion-item>
                <ion-input
                  v-model="staffForm.email"
                  label="Email"
                  label-placement="stacked"
                  placeholder="contoh@email.com"
                  type="email"
                  :disabled="!!editingStaff"
                />
              </ion-item>

              <ion-item v-if="!editingStaff">
                <ion-input
                  v-model="staffForm.password"
                  label="Password"
                  label-placement="stacked"
                  placeholder="Minimal 6 karakter"
                  type="password"
                />
              </ion-item>

              <ion-item>
                <ion-label>Role</ion-label>
                <ion-select v-model="staffForm.role" placeholder="Pilih role">
                  <ion-select-option value="CASHIER">Kasir</ion-select-option>
                  <ion-select-option value="BARISTA">Barista</ion-select-option>
                </ion-select>
              </ion-item>

              <div class="form-buttons">
                <ion-button expand="block" @click="saveStaff" :disabled="!isFormValid">
                  {{ editingStaff ? 'Update Staff' : 'Tambah Staff' }}
                </ion-button>
                <ion-button v-if="editingStaff" expand="block" fill="outline" @click="cancelEdit">
                  Batal
                </ion-button>
              </div>

              <p v-if="formError" class="error-message">{{ formError }}</p>
            </div>
          </div>

          <div class="setting-card info-card">
            <h3>ℹ️ Informasi Printer</h3>
            <p>Struk pembayaran akan dicetak menggunakan browser print dialog.</p>
            <p>Printer thermal bisa ditambahkan pada tahap berikutnya melalui Bluetooth/Capacitor.</p>
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
  IonInput,
  IonButton,
  IonToggle,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonIcon,
  IonSelect,
  IonSelectOption,
  toastController,
  alertController,
} from '@ionic/vue';
import { cloudUploadOutline } from 'ionicons/icons';
import { ref, onMounted, reactive, computed } from 'vue';
import { useSalesStore } from '../stores/sales';
import { useShopStore } from '../stores/shop';
import { useAuthStore } from '../stores/auth';
import { useTheme } from '../composables/useTheme';
import { useNotification } from '../composables/useNotification';
import { apiClient } from '../services/api';
import type { ShopSettings } from '../types';

const salesStore = useSalesStore();
const shopStore = useShopStore();
const authStore = useAuthStore();
const { isDark, toggleTheme } = useTheme();
const { showSuccess, showError } = useNotification();

const tax = ref(0);
const discount = ref(0);
const shopSettings = reactive<ShopSettings>({
  shopName: '',
  shopLogo: '',
  address: '',
  phone: '',
  printSettings: {
    showLogo: true,
    showAddress: true,
    paperWidth: 80,
  },
});

// Logo upload state
const fileInputRef = ref<HTMLInputElement | null>(null);
const logoInputMethod = ref<'emoji' | 'upload' | 'url'>('emoji');
const logoUrlInput = ref('');
const uploadStatus = ref('');
const uploadStatusClass = ref('');

// Staff management state
const staffList = ref<any[]>([]);
const editingStaff = ref<any>(null);
const staffForm = reactive({
  name: '',
  email: '',
  password: '',
  role: 'CASHIER' as 'CASHIER' | 'BARISTA',
});
const formError = ref('');

const isOwner = computed(() => authStore.isOwner);

const isFormValid = computed(() => {
  if (!staffForm.name.trim() || !staffForm.email.trim()) return false;
  if (staffForm.role !== 'CASHIER' && staffForm.role !== 'BARISTA') return false;
  
  if (editingStaff.value) {
    return true; // Edit mode doesn't need password
  }
  
  return staffForm.password.length >= 6;
});

onMounted(() => {
  tax.value = salesStore.taxPercent;
  
  shopStore.loadFromStorage();
  
  // Copy shop settings from store
  shopSettings.shopName = shopStore.settings.shopName;
  shopSettings.shopLogo = shopStore.settings.shopLogo;
  shopSettings.address = shopStore.settings.address || '';
  shopSettings.phone = shopStore.settings.phone || '';
  shopSettings.printSettings = { ...shopStore.settings.printSettings };

  // Load staff if user is OWNER
  if (isOwner.value) {
    loadStaffList();
  }
});

const loadStaffList = async () => {
  const allUsers = await apiClient.getAllUsers();
  staffList.value = allUsers.filter((u: any) => u.role !== 'OWNER');
};

const editStaff = (staff: any) => {
  editingStaff.value = staff;
  staffForm.name = staff.name;
  staffForm.email = staff.email;
  staffForm.password = '';
  staffForm.role = staff.role;
  formError.value = '';
};

const cancelEdit = () => {
  editingStaff.value = null;
  resetForm();
};

const resetForm = () => {
  staffForm.name = '';
  staffForm.email = '';
  staffForm.password = '';
  staffForm.role = 'CASHIER';
  formError.value = '';
};

const saveStaff = async () => {
  formError.value = '';

  if (!staffForm.name.trim()) {
    formError.value = 'Nama staff harus diisi';
    return;
  }

  if (!staffForm.email.trim()) {
    formError.value = 'Email harus diisi';
    return;
  }

  if (!editingStaff.value && staffForm.password.length < 6) {
    formError.value = 'Password minimal 6 karakter';
    return;
  }

  try {
    if (editingStaff.value) {
      // Update mode
      await apiClient.updateUser(editingStaff.value.id, {
        name: staffForm.name,
        role: staffForm.role
      });
      
      await showSuccess('Staff berhasil diupdate');
    } else {
      // Create new staff
      // Note: we use apiClient.createUser so it uses the protected /users endpoint
      const createRes = await apiClient.createUser({
        email: staffForm.email,
        password: staffForm.password,
        name: staffForm.name,
        role: staffForm.role
      });
      
      if (createRes.error) {
         formError.value = createRes.error;
         return;
      }
      
      await showSuccess('Staff berhasil ditambahkan');
    }

    await loadStaffList();
    resetForm();
    editingStaff.value = null;
  } catch (error: any) {
    formError.value = error.message || 'Gagal menyimpan staff';
  }
};

const deleteStaffConfirm = async (staff: any) => {
  const alert = await alertController.create({
    header: 'Hapus Staff',
    message: `Apakah Anda yakin ingin menghapus ${staff.name}?`,
    buttons: [
      {
        text: 'Batal',
        role: 'cancel',
      },
      {
        text: 'Hapus',
        role: 'destructive',
        handler: () => {
          deleteStaff(staff.id);
        },
      },
    ],
  });

  await alert.present();
};

const deleteStaff = async (staffId: string) => {
  try {
    const success = await apiClient.deleteUser(staffId);
    if (success) {
      await showSuccess('Staff berhasil dihapus');
      await loadStaffList();
    } else {
      await showError('Tidak dapat menghapus staff ini');
    }
  } catch (error: any) {
    await showError(error.message || 'Gagal menghapus staff');
  }
};

const saveShopSettings = async () => {
  shopStore.updateSettings({
    shopName: shopSettings.shopName,
    shopLogo: shopSettings.shopLogo,
    address: shopSettings.address,
    phone: shopSettings.phone,
  });

  const toast = await toastController.create({
    message: 'Pengaturan kedai disimpan',
    duration: 1500,
    position: 'top',
  });

  await toast.present();
};

const savePrintSettings = async () => {
  shopStore.updatePrintSettings(shopSettings.printSettings);

  const toast = await toastController.create({
    message: 'Pengaturan struk disimpan',
    duration: 1500,
    position: 'top',
  });

  await toast.present();
};

const saveTaxDiscount = async () => {
  salesStore.taxPercent = tax.value;

  const toast = await toastController.create({
    message: 'Setting disimpan',
    duration: 1500,
    position: 'top',
  });

  await toast.present();
};

// Logo upload methods
const isImageUrl = (str: string): boolean => {
  if (!str) return false;
  try {
    // Check if it's a data URL (base64)
    if (str.startsWith('data:image')) return true;
    // Check if it looks like a URL
    new URL(str);
    return str.match(/\.(jpg|jpeg|png|gif|webp)$/i) !== null;
  } catch {
    return false;
  }
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    uploadStatus.value = '';
    return;
  }

  // Validate file type
  const allowedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedFormats.includes(file.type)) {
    uploadStatus.value = '❌ Format tidak didukung! Gunakan: JPG, PNG, GIF, WebP';
    uploadStatusClass.value = 'error';
    return;
  }

  // Validate file size (2MB max)
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    uploadStatus.value = `❌ File terlalu besar! Maksimal 2MB (file: ${(file.size / 1024 / 1024).toFixed(2)}MB)`;
    uploadStatusClass.value = 'error';
    return;
  }

  try {
    uploadStatus.value = 'Mengupload...';
    uploadStatusClass.value = 'loading';

    const base64 = await fileToBase64(file);
    shopSettings.shopLogo = base64;

    uploadStatus.value = `✅ Logo berhasil diupload! (${(file.size / 1024).toFixed(2)}KB)`;
    uploadStatusClass.value = 'success';

    // Reset file input
    if (input) input.value = '';

    // Save automatically
    setTimeout(() => {
      saveShopSettings();
    }, 500);
  } catch (error) {
    uploadStatus.value = '❌ Gagal mengupload file';
    uploadStatusClass.value = 'error';
    console.error('Upload error:', error);
  }
};

const applyLogoUrl = async () => {
  if (!logoUrlInput.value.trim()) {
    uploadStatus.value = '❌ URL tidak boleh kosong';
    uploadStatusClass.value = 'error';
    return;
  }

  try {
    uploadStatus.value = 'Memvalidasi URL...';
    uploadStatusClass.value = 'loading';

    // Validate URL format
    new URL(logoUrlInput.value);

    // Try to load the image to validate it exists
    const img = new Image();
    img.onload = async () => {
      shopSettings.shopLogo = logoUrlInput.value;
      uploadStatus.value = '✅ Logo URL berhasil diterapkan!';
      uploadStatusClass.value = 'success';
      logoUrlInput.value = '';

      // Save automatically
      setTimeout(() => {
        saveShopSettings();
      }, 500);
    };
    img.onerror = () => {
      uploadStatus.value = '❌ Gagal memuat gambar dari URL. Periksa URL atau CORS policy';
      uploadStatusClass.value = 'error';
    };
    img.src = logoUrlInput.value;
  } catch (error) {
    uploadStatus.value = '❌ URL tidak valid. Gunakan format: https://example.com/image.png';
    uploadStatusClass.value = 'error';
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

.page-shell {
  padding: 16px;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.setting-card {
  background: var(--app-panel);
  border-radius: 22px;
  box-shadow: var(--app-soft-shadow);
  padding: 18px;
}

.setting-card h3 {
  margin-top: 0;
  margin-bottom: 14px;
  color: var(--ion-text-color);
}

.theme-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
}

.theme-row strong {
  color: var(--ion-text-color);
}

.theme-row p {
  margin: 6px 0 0;
  color: var(--app-muted);
}

.save-btn {
  --background: linear-gradient(135deg, #c26b2d, #e58b43);
  --border-radius: 16px;
  height: 50px;
  font-weight: 700;
}

.info-card p {
  color: var(--app-muted);
  line-height: 1.6;
}

.logo-section {
  margin: 14px 0;
}

.logo-section label {
  display: block;
  margin-bottom: 10px;
  color: var(--ion-text-color);
}

.logo-preview {
  background: var(--ion-background-color);
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-display {
  font-size: 48px;
  line-height: 1;
}

.logo-img {
  max-width: 100%;
  max-height: 120px;
  object-fit: contain;
}

.logo-placeholder {
  color: var(--app-muted);
  font-size: 14px;
  font-style: italic;
}

.logo-method-segment {
  --background: var(--app-panel-2);
  border-radius: 16px;
  padding: 4px;
  --color: var(--ion-text-color);
}

.format-info {
  background: rgba(194, 107, 45, 0.1);
  border-left: 4px solid #c26b2d;
  padding: 12px;
  border-radius: 8px;
  margin: 12px 0;
  font-size: 13px;
  color: var(--ion-text-color);
}

.format-info strong {
  display: block;
  margin-bottom: 8px;
  color: #c26b2d;
}

.format-info ul {
  margin: 0;
  padding-left: 20px;
  list-style: none;
}

.format-info li {
  margin: 6px 0;
  line-height: 1.5;
}

.upload-area {
  position: relative;
  margin-bottom: 12px;
}

.file-input {
  display: none;
}

.upload-button-area {
  background: var(--ion-background-color);
  border: 2px dashed var(--app-muted);
  border-radius: 14px;
  padding: 30px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-button-area:hover {
  border-color: #c26b2d;
  background: rgba(194, 107, 45, 0.05);
}

.upload-button-area:active {
  transform: scale(0.98);
}

.upload-icon {
  font-size: 32px;
  color: #c26b2d;
  display: block;
  margin-bottom: 8px;
}

.upload-button-area p {
  margin: 6px 0;
  color: var(--ion-text-color);
}

.upload-hint {
  font-size: 12px;
  color: var(--app-muted);
  margin-top: 8px !important;
}

.helper-text {
  font-size: 12px;
  color: var(--app-muted);
  margin: 8px 0 0;
  line-height: 1.5;
}

.apply-url-btn {
  --background: linear-gradient(135deg, #c26b2d, #e58b43);
  --border-radius: 16px;
  height: 45px;
  font-weight: 700;
}

#uploadStatus {
  margin-top: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
}

#uploadStatus.success,
p[class~="success"] {
  background: rgba(76, 175, 80, 0.15);
  color: #4caf50;
  border: 1px solid #4caf50;
}

#uploadStatus.error,
p[class~="error"] {
  background: rgba(244, 67, 54, 0.15);
  color: #f44336;
  border: 1px solid #f44336;
}

#uploadStatus.loading,
p[class~="loading"] {
  background: rgba(33, 150, 243, 0.15);
  color: #2196f3;
  border: 1px solid #2196f3;
}

/* Staff Management Styles */
.staff-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--app-muted);
}

.staff-section h4 {
  margin: 0 0 12px;
  color: var(--ion-text-color);
}

.empty-state {
  text-align: center;
  padding: 20px;
  color: var(--app-muted);
  font-style: italic;
}

.staff-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.staff-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--ion-background-color);
  border-radius: 12px;
  padding: 12px;
  border: 1px solid var(--app-muted);
}

.staff-info {
  flex: 1;
}

.staff-name {
  font-weight: 600;
  color: var(--ion-text-color);
  margin-bottom: 4px;
}

.staff-details {
  font-size: 12px;
  color: var(--app-muted);
  display: flex;
  align-items: center;
  gap: 8px;
}

.role-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.role-badge.cashier {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.role-badge.barista {
  background: rgba(33, 150, 243, 0.2);
  color: #2196f3;
}

.staff-actions {
  display: flex;
  gap: 6px;
}

.staff-form-section {
  padding: 14px;
  background: var(--ion-background-color);
  border-radius: 12px;
  margin-top: 16px;
}

.staff-form-section h4 {
  margin: 0 0 12px;
  color: var(--ion-text-color);
}

.form-buttons {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.form-buttons ion-button {
  --border-radius: 16px;
  height: 45px;
  font-weight: 600;
}

.form-buttons ion-button:first-child {
  --background: linear-gradient(135deg, #c26b2d, #e58b43);
}

.error-message {
  background: rgba(244, 67, 54, 0.15);
  color: #f44336;
  border: 1px solid #f44336;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13px;
  margin: 12px 0 0;
  text-align: center;
}

@media (max-width: 767px) {
  .theme-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .staff-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .staff-actions {
    align-self: flex-end;
    margin-top: 8px;
  }

  .form-buttons {
    flex-direction: column;
  }

  .form-buttons ion-button {
    width: 100%;
  }
}
</style>