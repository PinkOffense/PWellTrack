import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let nextId = 0;

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([]);

  function show(message: string, type: ToastType = 'success') {
    const id = ++nextId;
    toasts.value.push({ id, message, type });
    setTimeout(() => dismiss(id), 3500);
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }

  return { toasts, show, dismiss };
});
