<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import NavBar from '@/components/NavBar.vue';
import ToastContainer from '@/components/ToastContainer.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

const auth = useAuthStore();
const { locale } = useI18n();

onMounted(() => auth.init());

watch(locale, (lang) => {
  document.documentElement.lang = lang;
  localStorage.setItem('pwelltrack_lang', lang);
});
</script>

<template>
  <NavBar v-if="auth.user" />
  <router-view />
  <ToastContainer />
  <ConfirmDialog />
</template>
