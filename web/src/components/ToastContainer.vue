<script setup lang="ts">
import { useToastStore } from '@/stores/toast';
import { X } from 'lucide-vue-next';

const toast = useToastStore();
</script>

<template>
  <Teleport to="body">
    <div class="toast-container" aria-live="polite">
      <div
        v-for="t in toast.toasts"
        :key="t.id"
        :class="['toast', `toast-${t.type}`]"
        role="alert"
      >
        <span class="toast-msg">{{ t.message }}</span>
        <button class="toast-close" @click="toast.dismiss(t.id)" aria-label="Close">
          <X :size="14" />
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed; bottom: 24px; right: 24px; z-index: 9999;
  display: flex; flex-direction: column; gap: 8px;
  max-width: 380px;
}
.toast {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px; border-radius: var(--radius-md);
  background: #fff; box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  border-left: 4px solid;
  animation: slideUp 0.3s ease;
  font-size: 14px; font-weight: 500;
}
.toast-success { border-left-color: var(--c-success); color: #065f46; }
.toast-error { border-left-color: var(--c-danger); color: #991b1b; }
.toast-warning { border-left-color: var(--c-warning); color: #92400e; }
.toast-info { border-left-color: var(--c-info); color: #1e40af; }
.toast-msg { flex: 1; }
.toast-close {
  display: flex; align-items: center; justify-content: center;
  padding: 4px; border-radius: 6px; color: inherit; opacity: 0.5;
  transition: opacity 0.2s;
}
.toast-close:hover { opacity: 1; }
</style>
