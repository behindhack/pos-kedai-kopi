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
          <h1 class="logo-title">☕ Buat Akun</h1>
          <p class="subtitle">Daftar akun POS Kedai Kopi</p>
        </div>

        <div v-if="generalError" class="error-banner">
          <ion-icon :icon="alertCircleOutline" />
          <span>{{ generalError }}</span>
        </div>

        <form @submit.prevent="handleRegister" class="register-form">
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
  IonButton,
  IonSpinner,
  IonIcon,
} from '@ionic/vue';
import { alertCircleOutline } from 'ionicons/icons';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useNotification } from '@/composables/useNotification';
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
const isLoading = ref(false);
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
    const result = await auth.register(email.value, password.value, name.value);

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
  --padding-start: 12px;
  --padding-end: 12px;
  --min-height: 48px;
  border: 1px solid var(--ion-color-step-300);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.custom-input-item:focus-within {
  border-color: var(--ion-color-primary);
  box-shadow: 0 0 0 2px rgba(194, 107, 45, 0.1);
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