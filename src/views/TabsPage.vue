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