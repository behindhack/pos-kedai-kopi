// src/composables/useNotification.ts
import { toastController } from '@ionic/vue';

export const useNotification = () => {
  const showSuccess = async (message: string) => {
    const toast = await toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'success',
    });
    await toast.present();
  };

  const showError = async (message: string) => {
    const toast = await toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'danger',
    });
    await toast.present();
  };

  const showWarning = async (message: string) => {
    const toast = await toastController.create({
      message,
      duration: 2500,
      position: 'bottom',
      color: 'warning',
    });
    await toast.present();
  };

  return {
    showSuccess,
    showError,
    showWarning,
  };
};
