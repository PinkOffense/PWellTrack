import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export const useConfirmStore = defineStore('confirm', () => {
  const open = ref(false);
  const options = ref<ConfirmOptions>({ title: '', message: '' });
  let resolver: ((value: boolean) => void) | null = null;

  function show(opts: ConfirmOptions): Promise<boolean> {
    options.value = opts;
    open.value = true;
    return new Promise<boolean>((resolve) => {
      resolver = resolve;
    });
  }

  function resolve(value: boolean) {
    open.value = false;
    resolver?.(value);
    resolver = null;
  }

  return { open, options, show, resolve };
});
