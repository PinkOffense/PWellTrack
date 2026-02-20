<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { PawPrint, Settings, Bell, LogOut, X, Pill, Utensils } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useConfirmStore } from '@/stores/confirm';

const { t } = useI18n();
const auth = useAuthStore();
const confirm = useConfirmStore();
const router = useRouter();
const route = useRoute();

const bellOpen = ref(false);
const bellRef = ref<HTMLElement | null>(null);
const notifications = ref<any[]>([]);

function closeBell(e: MouseEvent) {
  if (bellRef.value && !bellRef.value.contains(e.target as Node)) bellOpen.value = false;
}
onMounted(() => document.addEventListener('click', closeBell));
onUnmounted(() => document.removeEventListener('click', closeBell));

const links = [
  { href: '/pets', key: 'pets.myPets', icon: PawPrint },
  { href: '/settings', key: 'settings.title', icon: Settings },
];

async function handleLogout() {
  const ok = await confirm.show({
    title: t('settings.logoutTitle'),
    message: t('settings.logoutConfirm'),
    confirmLabel: t('settings.logout'),
    cancelLabel: t('common.cancel'),
  });
  if (ok) {
    auth.logout();
    router.replace('/login');
  }
}
</script>

<template>
  <nav class="navbar" role="navigation" aria-label="Main navigation">
    <div class="navbar-inner">
      <router-link to="/pets" class="navbar-brand" aria-label="PWellTrack Home">
        <div class="navbar-logo">
          <img src="/ferret-sleeping.png" alt="PWellTrack logo" width="36" height="36" />
        </div>
        <span class="navbar-title">PWellTrack</span>
      </router-link>

      <div class="navbar-actions">
        <router-link
          v-for="link in links"
          :key="link.href"
          :to="link.href"
          :class="['nav-link', { active: route.path.startsWith(link.href) }]"
          :aria-label="t(link.key)"
        >
          <component :is="link.icon" :size="16" />
          <span class="nav-link-label">{{ t(link.key) }}</span>
        </router-link>

        <div ref="bellRef" class="nav-bell-wrap">
          <button class="btn-icon" @click.stop="bellOpen = !bellOpen" :aria-label="t('settings.notifications')">
            <Bell :size="16" />
            <span v-if="notifications.length" class="bell-badge">{{ notifications.length }}</span>
          </button>
          <div v-if="bellOpen" class="bell-dropdown animate-fadeIn">
            <div class="bell-header">{{ t('settings.notifications') }}</div>
            <div v-if="!notifications.length" class="bell-empty">{{ t('settings.noNotifications') }}</div>
          </div>
        </div>

        <button class="btn-icon btn-logout" @click="handleLogout" :aria-label="t('settings.logout')">
          <LogOut :size="16" />
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  position: sticky; top: 0; z-index: 50;
  border-bottom: 1px solid var(--c-border);
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 4px 20px rgba(155,142,200,0.06);
}
.navbar-inner {
  max-width: 1024px; margin: 0 auto; padding: 0 16px;
  height: 56px; display: flex; align-items: center; justify-content: space-between;
}
.navbar-brand { display: flex; align-items: center; gap: 10px; }
.navbar-logo {
  width: 36px; height: 36px; border-radius: 50%; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #f5f0ff, #ece5ff);
}
.navbar-logo img { width: 100%; height: 100%; object-fit: contain; }
.navbar-title {
  font-weight: 700; font-size: 18px;
  background: linear-gradient(to right, #9B8EC8, #B4A5D6);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
@media (max-width: 640px) { .navbar-title { display: none; } }
.navbar-actions { display: flex; align-items: center; gap: 4px; }
.nav-link {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 16px; border-radius: var(--radius-md); font-size: 14px; font-weight: 500;
  color: var(--c-txt-secondary); transition: all var(--transition);
}
.nav-link:hover { background: var(--c-primary-bg2); color: var(--c-primary); }
.nav-link.active { background: var(--c-primary-bg); color: var(--c-primary); box-shadow: 0 1px 3px rgba(155,142,200,0.08); }
.nav-link-label { display: none; }
@media (min-width: 640px) { .nav-link-label { display: inline; } }
.nav-bell-wrap { position: relative; }
.bell-badge {
  position: absolute; top: -2px; right: -2px;
  width: 16px; height: 16px; background: #ef4444; color: #fff;
  font-size: 10px; font-weight: 700; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.bell-dropdown {
  position: absolute; right: 0; top: 100%; margin-top: 8px;
  width: 288px; background: #fff; border-radius: var(--radius-md);
  box-shadow: 0 12px 40px rgba(0,0,0,0.12); border: 1px solid #f3f4f6;
  overflow: hidden; z-index: 50;
}
.bell-header { padding: 12px 16px; border-bottom: 1px solid #f3f4f6; font-weight: 600; font-size: 14px; color: var(--c-txt); }
.bell-empty { padding: 24px 16px; text-align: center; font-size: 14px; color: var(--c-txt-muted); }
.btn-logout:hover { background: var(--c-danger-bg); color: var(--c-danger); }
</style>
