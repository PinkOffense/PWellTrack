<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { PawPrint } from 'lucide-vue-next';

const { t } = useI18n();
</script>

<template>
  <main class="notfound">
    <div class="notfound-card animate-slideUp">
      <div class="notfound-icon">
        <PawPrint :size="48" />
      </div>
      <h1 class="notfound-title">404</h1>
      <p class="notfound-msg">{{ t('common.oops') }}</p>
      <router-link to="/pets" class="btn-primary">
        {{ t('pets.myPets') }}
      </router-link>
    </div>
  </main>
</template>

<style scoped>
.notfound {
  min-height: 80vh; display: flex; align-items: center; justify-content: center;
  padding: 24px;
}
.notfound-card { text-align: center; }
.notfound-icon {
  width: 96px; height: 96px; border-radius: 50%;
  background: linear-gradient(135deg, #f5f0ff, #ece5ff);
  display: flex; align-items: center; justify-content: center;
  color: var(--c-primary); margin: 0 auto 20px;
}
.notfound-title {
  font-size: 48px; font-weight: 800;
  background: linear-gradient(to right, #9B8EC8, #B4A5D6);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  margin-bottom: 8px;
}
.notfound-msg { font-size: 16px; color: var(--c-txt-muted); margin-bottom: 24px; }
</style>
