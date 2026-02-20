<script setup lang="ts">
import { ref, onMounted } from 'vue';

const videoRef = ref<HTMLVideoElement | null>(null);

onMounted(() => {
  const video = videoRef.value;
  if (!video) return;
  video.play().catch(() => {
    // autoplay blocked — video stays on poster/first frame
  });
});
</script>

<template>
  <div class="ferret-banner">
    <video
      ref="videoRef"
      src="/ferret-animation.mp4"
      muted
      playsinline
      preload="metadata"
      poster="/ferret-poster.jpg"
      class="ferret-video"
    />
    <div class="ferret-fade" />
  </div>
</template>

<style scoped>
.ferret-banner {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  aspect-ratio: 16 / 5;
}
.ferret-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.ferret-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 24px;
  background: linear-gradient(to top, rgba(255,255,255,0.85), transparent);
  pointer-events: none;
}
</style>
