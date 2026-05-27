import { ref } from 'vue';

const isDark = ref(false);

export function useTheme() {
  const applyTheme = (dark: boolean) => {
    isDark.value = dark;
    document.body.classList.toggle('dark', dark);
    localStorage.setItem('pos-dark-mode', dark ? '1' : '0');
  };

  const toggleTheme = () => {
    applyTheme(!isDark.value);
  };

  return {
    isDark,
    applyTheme,
    toggleTheme,
  };
}