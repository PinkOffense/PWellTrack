<script setup lang="ts">
import { ref } from 'vue';
import { PawPrint, Cat, Rabbit } from 'lucide-vue-next';
import { resolvePhotoUrl } from '@/lib/photos';

const props = withDefaults(defineProps<{
  photoUrl?: string | null;
  name: string;
  species?: string;
  size?: number;
}>(), {
  size: 48,
});

const photoError = ref(false);
const resolved = resolvePhotoUrl(props.photoUrl);
const iconSize = Math.round(props.size * 0.5);
</script>

<template>
  <div class="pet-avatar" :style="{ width: size + 'px', height: size + 'px' }">
    <img
      v-if="resolved && !photoError"
      :src="resolved"
      :alt="name"
      class="pet-avatar-img"
      @error="photoError = true"
    />
    <div v-else class="pet-avatar-fallback">
      <Cat v-if="species === 'cat'" :size="iconSize" />
      <Rabbit v-else-if="species === 'exotic'" :size="iconSize" />
      <PawPrint v-else :size="iconSize" />
    </div>
  </div>
</template>

<style scoped>
.pet-avatar {
  border-radius: 50%; overflow: hidden; flex-shrink: 0;
}
.pet-avatar-img {
  width: 100%; height: 100%; object-fit: cover;
}
.pet-avatar-fallback {
  width: 100%; height: 100%;
  background: linear-gradient(135deg, #f5f0ff, #ece5ff);
  display: flex; align-items: center; justify-content: center;
  color: var(--c-primary);
}
</style>
