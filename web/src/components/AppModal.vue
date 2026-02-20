<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { X } from 'lucide-vue-next';

const props = defineProps<{
  title: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close');
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown);
  document.body.style.overflow = 'hidden';
});
onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown);
  document.body.style.overflow = '';
});
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="emit('close')">
      <div class="modal animate-slideUp" role="dialog" aria-modal="true" :aria-label="props.title">
        <div class="modal-header">
          <h2 class="modal-title">{{ props.title }}</h2>
          <button class="btn-icon" @click="emit('close')" aria-label="Close">
            <X :size="18" />
          </button>
        </div>
        <div class="modal-body">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; z-index: 8000;
  background: rgba(0,0,0,0.3); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
}
.modal {
  background: #fff; border-radius: var(--radius-lg);
  max-width: 520px; width: 100%; max-height: 90vh;
  display: flex; flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid var(--c-border);
}
.modal-title { font-size: 18px; font-weight: 700; color: var(--c-txt); }
.modal-body { padding: 24px; overflow-y: auto; }
</style>
