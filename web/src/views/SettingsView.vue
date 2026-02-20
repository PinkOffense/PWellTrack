<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Camera, Check, LogOut } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import { useConfirmStore } from '@/stores/confirm';
import { authApi } from '@/lib/api';
import { resolvePhotoUrl } from '@/lib/photos';

const { t, locale } = useI18n();
const router = useRouter();
const auth = useAuthStore();
const toast = useToastStore();
const confirm = useConfirmStore();

const photoUploading = ref(false);
const photoError = ref(false);

const resolved = computed(() => resolvePhotoUrl(auth.user?.photo_url));
const initials = computed(() => auth.user?.name?.slice(0, 2).toUpperCase() || '');

async function handlePickPhoto(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  photoUploading.value = true;
  try {
    await authApi.uploadPhoto(file);
    await auth.refreshUser();
    photoError.value = false;
  } catch (err: any) {
    toast.show(err.message, 'error');
  } finally {
    photoUploading.value = false;
  }
}

async function handleRemovePhoto() {
  photoUploading.value = true;
  try {
    await authApi.deletePhoto();
    await auth.refreshUser();
    photoError.value = false;
  } catch (err: any) {
    toast.show(err.message, 'error');
  } finally {
    photoUploading.value = false;
  }
}

function changeLanguage(lang: string) {
  locale.value = lang;
  localStorage.setItem('pwelltrack_lang', lang);
}

async function handleLogout() {
  const ok = await confirm.show({
    title: t('settings.logout'),
    message: t('settings.logoutConfirm'),
    confirmLabel: t('settings.logout'),
    danger: true,
  });
  if (ok) {
    auth.logout();
    router.replace('/login');
  }
}
</script>

<template>
  <main class="container" style="padding-top: 24px; padding-bottom: 48px;">
    <h1 class="page-title mb-5">{{ t('settings.title') }}</h1>

    <!-- Profile Section -->
    <section v-if="auth.user" class="settings-section">
      <div class="card profile-card">
        <div class="profile-row">
          <label class="avatar-wrap" :class="{ uploading: photoUploading }">
            <img
              v-if="resolved && !photoError"
              :src="resolved"
              :alt="auth.user.name"
              class="avatar-img"
              @error="photoError = true"
            />
            <div v-else class="avatar-fallback">
              <span class="avatar-initials">{{ initials }}</span>
            </div>
            <div class="avatar-badge">
              <div v-if="photoUploading" class="spinner-sm spinner" />
              <Camera v-else :size="14" />
            </div>
            <input type="file" accept="image/*" class="sr-only" :disabled="photoUploading" @change="handlePickPhoto" />
          </label>
          <div class="profile-info">
            <div class="profile-name">{{ auth.user.name }}</div>
            <div class="profile-email">{{ auth.user.email }}</div>
            <div class="photo-actions">
              <label class="photo-link">
                {{ t('profile.changePhoto') }}
                <input type="file" accept="image/*" class="sr-only" :disabled="photoUploading" @change="handlePickPhoto" />
              </label>
              <template v-if="auth.user.photo_url">
                <span class="photo-dot">&middot;</span>
                <button class="photo-remove" :disabled="photoUploading" @click="handleRemovePhoto">
                  {{ t('profile.removePhoto') }}
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Language Section -->
    <section class="settings-section">
      <h2 class="section-label">{{ t('settings.language') }}</h2>
      <div class="card">
        <button
          :class="['lang-option', locale === 'en' && 'lang-active']"
          @click="changeLanguage('en')"
        >
          <div class="lang-row">
            <span class="lang-flag">EN</span>
            <span :class="['lang-label', locale === 'en' && 'lang-label-active']">{{ t('settings.english') }}</span>
          </div>
          <Check v-if="locale === 'en'" :size="20" class="text-primary" />
        </button>
        <div class="lang-divider" />
        <button
          :class="['lang-option', locale === 'pt' && 'lang-active']"
          @click="changeLanguage('pt')"
        >
          <div class="lang-row">
            <span class="lang-flag">PT</span>
            <span :class="['lang-label', locale === 'pt' && 'lang-label-active']">{{ t('settings.portuguese') }}</span>
          </div>
          <Check v-if="locale === 'pt'" :size="20" class="text-primary" />
        </button>
      </div>
    </section>

    <!-- Logout Section -->
    <section class="settings-section">
      <button class="logout-btn" @click="handleLogout">
        <LogOut :size="18" />
        <span>{{ t('settings.logout') }}</span>
      </button>
    </section>
  </main>
</template>

<style scoped>
.page-title { font-size: 24px; font-weight: 700; color: var(--c-txt); }
.settings-section { margin-bottom: 24px; }
.section-label {
  font-size: 14px; font-weight: 600; color: var(--c-txt-secondary);
  margin-bottom: 8px; padding-left: 4px;
}

/* Profile */
.profile-card { padding: 20px; }
.profile-row { display: flex; align-items: center; gap: 16px; }
.avatar-wrap {
  position: relative; cursor: pointer; width: 64px; height: 64px; flex-shrink: 0;
}
.avatar-wrap.uploading { opacity: 0.6; pointer-events: none; }
.avatar-img { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; }
.avatar-fallback {
  width: 64px; height: 64px; border-radius: 50%;
  background: linear-gradient(135deg, #B4A5D6, #9B8EC8);
  display: flex; align-items: center; justify-content: center;
}
.avatar-initials { font-size: 20px; font-weight: 700; color: #fff; }
.avatar-badge {
  position: absolute; bottom: -2px; right: -2px;
  width: 24px; height: 24px; border-radius: 50%;
  background: var(--c-primary); color: #fff;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid #fff;
}
.profile-info { flex: 1; min-width: 0; }
.profile-name { font-size: 18px; font-weight: 700; color: var(--c-txt); }
.profile-email { font-size: 13px; color: var(--c-txt-secondary); margin-top: 2px; }
.photo-actions { display: flex; align-items: center; gap: 4px; margin-top: 8px; }
.photo-link {
  font-size: 12px; font-weight: 600; color: var(--c-primary); cursor: pointer;
}
.photo-link:hover { text-decoration: underline; }
.photo-dot { font-size: 12px; color: var(--c-txt-muted); }
.photo-remove {
  font-size: 12px; font-weight: 600; color: var(--c-danger);
}
.photo-remove:hover { text-decoration: underline; }

/* Language */
.lang-option {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; width: 100%; transition: background var(--transition);
}
.lang-option:hover { background: var(--c-primary-bg2); }
.lang-active { background: var(--c-surface); }
.lang-row { display: flex; align-items: center; gap: 12px; }
.lang-flag {
  font-size: 14px; font-weight: 700; color: var(--c-primary);
  width: 32px; text-align: center;
}
.lang-label { font-size: 16px; color: var(--c-txt); }
.lang-label-active { font-weight: 600; color: var(--c-primary); }
.lang-divider { height: 1px; background: var(--c-border); margin: 0 16px; }

/* Logout */
.logout-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; padding: 14px;
  background: var(--c-card); border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  color: var(--c-danger); font-size: 16px; font-weight: 600;
  transition: all var(--transition);
}
.logout-btn:hover { background: var(--c-danger-bg); }
</style>
