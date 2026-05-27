<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { onMounted } from 'vue';
import { useTheme } from './composables/useTheme';
import { useAuthStore } from './stores/auth';

const { applyTheme } = useTheme();
const auth = useAuthStore();

onMounted(() => {
  // Load theme preference
  const saved = localStorage.getItem('pos-dark-mode');
  if (saved === '1') {
    applyTheme(true);
  } else if (saved === '0') {
    applyTheme(false);
  }

  // Load auth state from storage
  auth.loadFromStorage();
});
</script>
