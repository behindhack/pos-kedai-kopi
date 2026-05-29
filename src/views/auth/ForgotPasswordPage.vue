<template>
  <ion-page>
    <ion-content class="ion-padding auth-content">
      <div class="auth-container">
        <div class="logo-container">
          <div class="logo-circle">
            <ion-icon :icon="cafe" class="logo-icon"></ion-icon>
          </div>
          <h1>Lupa Password</h1>
          <p>Masukkan email yang terdaftar untuk mengatur ulang kata sandi Anda.</p>
        </div>

        <form @submit.prevent="handleForgotPassword" class="auth-form">
          <div class="input-group">
            <ion-item lines="none" class="custom-input">
              <ion-icon :icon="mailOutline" slot="start" class="input-icon"></ion-icon>
              <ion-input
                v-model="email"
                type="email"
                placeholder="Alamat Email"
                required
                :disabled="isLoading"
              ></ion-input>
            </ion-item>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="error-message">
            <ion-icon :icon="alertCircleOutline"></ion-icon>
            <span>{{ error }}</span>
          </div>

          <!-- Success Message -->
          <div v-if="successMessage" class="success-message">
            <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
            <span>{{ successMessage }}</span>
          </div>
          
          <!-- Dev Token Message (for testing without email) -->
          <div v-if="devToken" class="dev-token-message">
            <p><strong>[DEV ONLY]</strong> Link Reset Anda:</p>
            <a :href="`/auth/reset-password/${devToken}`">Klik di sini untuk Reset Password</a>
          </div>

          <ion-button 
            type="submit" 
            expand="block" 
            class="submit-btn" 
            :disabled="isLoading || !!successMessage"
          >
            <ion-spinner v-if="isLoading" name="crescent"></ion-spinner>
            <span v-else>Kirim Tautan Reset</span>
          </ion-button>
        </form>

        <div class="auth-links">
          <p>Ingat password Anda? <router-link to="/auth/login" class="link">Kembali ke Login</router-link></p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
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
  mailOutline, 
  alertCircleOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const email = ref('');
const isLoading = ref(false);
const error = ref('');
const successMessage = ref('');
const devToken = ref('');

const handleForgotPassword = async () => {
  if (!email.value) return;
  
  isLoading.value = true;
  error.value = '';
  successMessage.value = '';
  devToken.value = '';

  try {
    const result = await authStore.forgotPassword(email.value);
    
    if (result.success) {
      successMessage.value = 'Jika email terdaftar, instruksi reset akan dikirim (atau lihat link dev di bawah).';
      if (result.devToken) {
        devToken.value = result.devToken;
      }
    } else {
      error.value = result.error || 'Terjadi kesalahan. Silakan coba lagi.';
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
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
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

.dev-token-message {
  background: var(--app-warning-bg);
  color: var(--ion-color-warning);
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  border: 1px solid var(--ion-color-warning);
  margin-top: 0.5rem;
}

.dev-token-message a {
  color: var(--ion-color-primary);
  font-weight: bold;
  text-decoration: underline;
  display: block;
  margin-top: 0.5rem;
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

.auth-links {
  margin-top: 2rem;
  text-align: center;
}

.link {
  color: var(--ion-color-primary);
  font-weight: 600;
  text-decoration: none;
  transition: opacity 0.2s;
}

.link:hover {
  opacity: 0.8;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .auth-container {
    padding: 1.5rem;
    margin-top: 5vh;
  }
}
</style>
