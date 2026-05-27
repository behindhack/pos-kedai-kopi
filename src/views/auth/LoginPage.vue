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
            <svg viewBox="0 0 100 100" class="coffee-svg">
              <!-- Steam -->
              <path class="steam steam-1" d="M35 38 Q37 28 35 18 Q33 8 35 0" />
              <path class="steam steam-2" d="M50 35 Q52 25 50 15 Q48 5 50 -5" />
              <path class="steam steam-3" d="M65 38 Q67 28 65 18 Q63 8 65 0" />
              <!-- Cup body -->
              <path d="M20 42 L20 72 Q20 85 35 88 L65 88 Q80 85 80 72 L80 42 Z" fill="#6F4E37" />
              <!-- Cup shine -->
              <path d="M28 48 L28 68 Q28 76 36 78" stroke="rgba(255,255,255,0.2)" stroke-width="3" fill="none" stroke-linecap="round" />
              <!-- Handle -->
              <path d="M80 50 Q95 50 95 62 Q95 74 80 74" stroke="#6F4E37" stroke-width="6" fill="none" stroke-linecap="round" />
              <!-- Coffee surface -->
              <ellipse cx="50" cy="44" rx="30" ry="5" fill="#8B6914" />
              <!-- Saucer -->
              <ellipse cx="50" cy="92" rx="38" ry="6" fill="#5C3D2E" />
            </svg>
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
                autocomplete="email"
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
                autocomplete="current-password"
                @ionBlur="validatePassword"
              />
            </ion-item>
            <div v-if="errors.password" class="error-text">
              <ion-icon :icon="alertCircleOutline" />
              {{ errors.password }}
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

        <div class="demo-credentials">
          <div class="demo-header">
            <p class="demo-title">📝 Demo Credentials:</p>
            <button class="reset-btn" @click="resetDemoData" title="Klik untuk reset data demo">⟲ Reset</button>
          </div>
          <div class="credentials-list">
            <div class="credential-item" @click="fillDemo('owner@kedaikopi.com', 'owner123')">
              <span class="role-badge owner">OWNER</span>
              <div class="credential-info">
                <span class="email">owner@kedaikopi.com</span>
                <span class="password-hint">owner123</span>
              </div>
            </div>
            <div class="credential-item" @click="fillDemo('cashier@kedaikopi.com', 'cashier123')">
              <span class="role-badge cashier">CASHIER</span>
              <div class="credential-info">
                <span class="email">cashier@kedaikopi.com</span>
                <span class="password-hint">cashier123</span>
              </div>
            </div>
            <div class="credential-item" @click="fillDemo('barista@kedaikopi.com', 'barista123')">
              <span class="role-badge barista">BARISTA</span>
              <div class="credential-info">
                <span class="email">barista@kedaikopi.com</span>
                <span class="password-hint">barista123</span>
              </div>
            </div>
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

const fillDemo = (demoEmail: string, demoPassword: string) => {
  email.value = demoEmail;
  password.value = demoPassword;
  errors.value = {};
};

const resetDemoData = () => {
  // Force re-initialize demo data in localStorage
  localStorage.removeItem('users');
  localStorage.removeItem('products');
  localStorage.removeItem('sales');
  
  // Reload the api client to re-initialize
  window.location.reload();
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
  width: 120px;
  height: 120px;
  margin: 0 auto 12px;
}

.coffee-svg {
  width: 100%;
  height: 100%;
}

.steam {
  fill: none;
  stroke: rgba(210, 170, 110, 0.5);
  stroke-width: 2.5;
  stroke-linecap: round;
  animation: steamRise 2.5s ease-in-out infinite;
}

.steam-2 {
  animation-delay: 0.4s;
  stroke: rgba(210, 170, 110, 0.4);
}

.steam-3 {
  animation-delay: 0.8s;
  stroke: rgba(210, 170, 110, 0.35);
}

@keyframes steamRise {
  0% { opacity: 0.3; transform: translateY(0); }
  50% { opacity: 0.8; }
  100% { opacity: 0; transform: translateY(-8px); }
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

.login-button {
  height: 48px;
  font-weight: 600;
  font-size: 16px;
  margin-top: 8px;
  --border-radius: 8px;
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

.demo-credentials {
  background-color: var(--ion-color-step-100);
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid var(--ion-color-primary);
}

.demo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.demo-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--ion-color-medium);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.reset-btn {
  background: none;
  border: 1px solid var(--ion-color-medium);
  color: var(--ion-color-medium);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.reset-btn:hover {
  background-color: var(--ion-color-step-200);
  border-color: var(--ion-color-primary);
  color: var(--ion-color-primary);
}

.credentials-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.credential-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  font-size: 12px;
}

.credential-item:hover {
  background-color: var(--ion-color-step-50);
  border-color: var(--ion-color-primary);
  transform: translateX(2px);
}

.credential-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.credential-info .email {
  font-size: 11px;
  color: var(--ion-color-dark);
  font-weight: 500;
  word-break: break-all;
}

.credential-info .password-hint {
  font-size: 10px;
  color: var(--ion-color-medium);
  font-family: monospace;
  background-color: var(--ion-color-step-100);
  padding: 2px 4px;
  border-radius: 2px;
  display: inline-block;
  width: fit-content;
}

.role-badge {
  font-size: 9px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 3px;
  color: white;
  min-width: 50px;
  text-align: center;
}

.role-badge.owner {
  background-color: var(--ion-color-danger);
}

.role-badge.cashier {
  background-color: var(--ion-color-success);
}

.role-badge.barista {
  background-color: var(--ion-color-warning);
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