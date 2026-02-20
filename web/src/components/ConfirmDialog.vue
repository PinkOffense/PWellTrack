<script setup lang="ts">
import { useConfirmStore } from '@/stores/confirm';
import { useI18n } from 'vue-i18n';

const confirm = useConfirmStore();
const { t } = useI18n();
</script>

<template>
  <Teleport to="body">
    <div v-if="confirm.open" class="overlay" @click.self="confirm.resolve(false)">
      <div class="dialog animate-slideUp" role="alertdialog" aria-modal="true">
        <h3 class="dialog-title">{{ confirm.options.title }}</h3>
        <p class="dialog-message">{{ confirm.options.message }}</p>
        <div class="dialog-actions">
          <button class="btn-secondary" @click="confirm.resolve(false)">
            {{ confirm.options.cancelLabel || t('common.cancel') }}
          </button>
          <button
            :class="confirm.options.danger ? 'btn-confirm-danger' : 'btn-primary'"
            @click="confirm.resolve(true)"
          >
            {{ confirm.options.confirmLabel || t('common.confirm') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed; inset: 0; z-index: 9000;
  background: rgba(0,0,0,0.3); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
}
.dialog {
  background: #fff; border-radius: var(--radius-lg);
  padding: 28px; max-width: 400px; width: 100%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}
.dialog-title {
  font-size: 18px; font-weight: 700; color: var(--c-txt);
  margin-bottom: 8px;
}
.dialog-message {
  font-size: 14px; color: var(--c-txt-secondary);
  line-height: 1.5; margin-bottom: 24px;
}
.dialog-actions {
  display: flex; gap: 12px; justify-content: flex-end;
}
.btn-confirm-danger {
  display: inline-flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 600; padding: 10px 20px;
  border-radius: var(--radius-md); font-size: 14px;
  background: var(--c-danger);
  transition: all var(--transition);
}
.btn-confirm-danger:hover { opacity: 0.9; }
</style>
