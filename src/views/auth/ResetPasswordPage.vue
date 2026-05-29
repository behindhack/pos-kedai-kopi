<template>
  <ion-page>
    <ion-content class="ion-padding auth-content">
      <div class="auth-container">
        <div class="logo-container">
          <div class="logo-circle">
            <ion-icon :icon="cafe" class="logo-icon"></ion-icon>
          </div>
          <h1>Reset Password</h1>
          <p>Masukkan kata sandi baru Anda.</p>
        </div>

        <form @submit.prevent="handleResetPassword" class="auth-form">
          <div class="input-group">
            <ion-item lines="none" class="custom-input">
              <ion-icon :icon="lockClosedOutline" slot="start" class="input-icon"></ion-icon>
              <ion-input
                v-model="newPassword"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Kata Sandi Baru"
                required
                :disabled="isLoading || isSuccess"
              ></ion-input>
              <ion-icon 
                :icon="showPassword ? eyeOffOutline : eyeOutline" 
                slot="end" 
                class="password-toggle"
                @click="showPassword = !showPassword"
              ></ion-icon>
            </ion-item>
          </div>

          <div class="input-group">
            <ion-item lines="none" class="custom-input">
              <ion-icon :icon="lockClosedOutline" slot="start" class="input-icon"></ion-icon>
              <ion-input
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Konfirmasi Kata Sandi"
                required
                :disabled="isLoading || isSuccess"
              ></ion-input>
              <ion-icon 
                :icon="showConfirmPassword ? eyeOffOutline : eyeOutline" 
                slot="end" 
                class="password-toggle"
                @click="showConfirmPassword = !showConfirmPassword"
              ></ion-icon>
            </ion-item>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="error-message">
            <ion-icon :icon="alertCircleOutline"></ion-icon>
            <span>{{ error }}</span>
          </div>

          <!-- Success Message -->
          <div v-if="isSuccess" class="success-message">
            <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
            <span>Password berhasil direset. Silakan login.</span>
          </div>

          <ion-button 
            v-if="!isSuccess"
            type="submit" 
            expand="block" 
            class="submit-btn" 
            :disabled="isLoading"
          >
            <ion-spinner v-if="isLoading" name="crescent"></ion-spinner>
            <span v-else>Simpan Kata Sandi</span>
          </ion-button>
          
          <ion-button 
            v-else
            router-link="/auth/login"
            expand="block" 
            class="submit-btn" 
          >
            Kembali ke Login
          </ion-button>
        </form>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  IonPage, 
  IonContent, 
  IonItem, 
  IonInput, 
  IonButton, 
  IonIcon,
  IonSpinner
} from '@ionic/vue';
import { 
  cafe, 
  lockClosedOutline, 
  eyeOutline, 
  eyeOffOutline,
  alertCircleOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const newPassword = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const isLoading = ref(false);
const error = ref('');
const isSuccess = ref(false);

const handleResetPassword = async () => {
  const token = route.params.token as string;
  
  if (!token) {
    error.value = 'Token tidak valid';
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Konfirmasi password tidak cocok';
    return;
  }

  if (newPassword.value.length < 6) {
    error.value = 'Password minimal 6 karakter';
    return;
  }
  
  isLoading.value = true;
  error.value = '';

  try {
    const result = await authStore.resetPassword(token, newPassword.value);
    
    if (result.success) {
      isSuccess.value = true;
    } else {
      error.value = result.error || 'Gagal mereset password. Token mungkin kadaluarsa.';
    }
  } catch (err: any) {
    error.value = err.message || 'Terjadi kesalahan sistem';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.auth-content {
  --background: var(--ion-background-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-container {
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  background: var(--app-panel);
  border-radius: 12px;
  box-shadow: var(--app-soft-shadow);
  overflow: hidden;
  margin-top: 10vh;
}

.logo-container {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo-circle {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-primary-tint));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  box-shadow: 0 8px 16px rgba(var(--ion-color-primary-rgb), 0.3);
}

.logo-icon {
  font-size: 40px;
  color: white;
}

h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--ion-text-color);
  margin: 0 0 0.5rem;
}

p {
  color: var(--app-muted);
  font-size: 0.95rem;
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.custom-input {
  --background: var(--app-input-bg);
  --border-radius: 12px;
  --padding-start: 1rem;
  --inner-padding-end: 1rem;
  border: 1px solid var(--ion-border-color);
  transition: all 0.3s ease;
}

.custom-input:focus-within {
  border-color: var(--ion-color-primary);
  box-shadow: 0 0 0 3px rgba(var(--ion-color-primary-rgb), 0.1);
}

.input-icon {
  color: var(--app-muted);
  margin-right: 0.8rem;
  font-size: 1.2rem;
}

.password-toggle {
  color: var(--app-muted);
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s;
}

.password-toggle:hover {
  color: var(--ion-color-primary);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--ion-color-danger);
  background: rgba(var(--ion-color-danger-rgb), 0.1);
  padding: 0.8rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--ion-color-success);
  background: rgba(var(--ion-color-success-rgb), 0.1);
  padding: 0.8rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
}

.submit-btn {
  margin-top: 0.5rem;
  --border-radius: 12px;
  --padding-top: 1rem;
  --padding-bottom: 1rem;
  font-weight: 600;
  font-size: 1.05rem;
  letter-spacing: 0.5px;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .auth-container {
    padding: 1.5rem;
    margin-top: 5vh;
  }
}
</style>
