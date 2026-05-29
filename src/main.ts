// src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { IonicVue } from '@ionic/vue';
import App from './App.vue';
import router from './router';

// Membersihkan cache transaksi dari localStorage (sementara)
localStorage.removeItem('sales');
localStorage.removeItem('pending_orders');

import '@ionic/vue/css/core.css';
import './theme/variables.css';

const app = createApp(App)
  .use(IonicVue)
  .use(createPinia())
  .use(router);

router.isReady().then(() => {
  app.mount('#app');
});