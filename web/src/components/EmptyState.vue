<script setup lang="ts">
import { PawPrint } from 'lucide-vue-next';

defineProps<{
  title: string;
  subtitle?: string;
}>();
</script>

<template>
  <div class="empty-state animate-fadeIn">
    <div class="empty-icon">
      <PawPrint :size="40" />
    </div>
    <h3 class="empty-title">{{ title }}</h3>
    <p v-if="subtitle" class="empty-subtitle">{{ subtitle }}</p>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 48px 24px; text-align: center;
}
.empty-icon {
  width: 80px; height: 80px; border-radius: 50%;
  background: linear-gradient(135deg, #f5f0ff, #ece5ff);
  display: flex; align-items: center; justify-content: center;
  color: var(--c-primary); margin-bottom: 20px;
}
.empty-title { font-size: 18px; font-weight: 700; color: var(--c-txt); margin-bottom: 6px; }
.empty-subtitle { font-size: 14px; color: var(--c-txt-muted); max-width: 280px; line-height: 1.5; }
</style>
