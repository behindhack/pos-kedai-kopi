<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { onMounted, watch } from 'vue';
import { useTheme } from './composables/useTheme';
import { useAuthStore } from './stores/auth';
import { useSalesStore } from './stores/sales';

const { applyTheme } = useTheme();
const auth = useAuthStore();
const sales = useSalesStore();

onMounted(async () => {
  // Load theme preference
  const saved = localStorage.getItem('pos-dark-mode');
  if (saved === '1') {
    applyTheme(true);
  } else if (saved === '0') {
    applyTheme(false);
  }

  // Load auth state from storage
  await auth.loadFromStorage();
  
  if (auth.isAuthenticated) {
    sales.startPolling();
  }
});

watch(() => auth.isAuthenticated, (isAuth) => {
  if (isAuth) {
    sales.startPolling();
  } else {
    sales.stopPolling();
  }
});
</script>
