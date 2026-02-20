<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Mail, Lock, Eye, EyeOff, User, Heart } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';

const { t } = useI18n();
const router = useRouter();
const auth = useAuthStore();

const name = ref('');
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const googleLoading = ref(false);
const error = ref('');
const canSubmit = computed(() => auth.backendReachable && !loading.value);

async function handleRegister() {
  error.value = '';
  if (!name.value || !email.value || !password.value) {
    error.value = t('auth.fillAllFields');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    error.value = t('auth.invalidEmail');
    return;
  }
  if (password.value.length < 6) {
    error.value = t('auth.passwordMin');
    return;
  }
  loading.value = true;
  try {
    await auth.register(name.value.trim(), email.value.trim().toLowerCase(), password.value);
    router.replace('/pets');
  } catch (e: any) {
    error.value = e.message || t('auth.registerFailed');
  } finally {
    loading.value = false;
  }
}

async function handleGoogle() {
  googleLoading.value = true;
  try {
    await auth.loginWithGoogle();
  } catch (e: any) {
    error.value = e.message || t('auth.googleFailed');
  } finally {
    googleLoading.value = false;
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-bg">
      <div v-for="i in 5" :key="i" :class="'heart heart-' + i">
        <Heart :size="18" />
      </div>
    </div>

    <div class="auth-card animate-slideUp">
      <div class="auth-hero">
        <div class="hero-circles">
          <div class="hero-circle hero-circle-outer" />
          <div class="hero-circle hero-circle-inner">
            <Heart :size="28" />
          </div>
        </div>
        <h1 class="auth-title">{{ t('auth.joinTitle') }}</h1>
        <p class="auth-subtitle">{{ t('auth.createYourAccount') }}</p>
      </div>

      <div v-if="auth.warming || auth.loading" class="alert-warming mb-4">
        <div class="warming-spinner" />
        <div>
          <p class="warming-title">{{ t('auth.warmingUp') }}</p>
          <p class="warming-hint">{{ t('auth.warmingHint') }}</p>
        </div>
      </div>

      <div v-else-if="!auth.backendReachable" class="alert-warning mb-4">
        <p>{{ t('auth.offlineMsg') }}</p>
        <button class="btn-retry mt-2" @click="auth.retryBackend()">{{ t('auth.retryConnection') }}</button>
      </div>

      <div v-if="error" class="alert-error mb-4">{{ error }}</div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-field">
          <label class="label">{{ t('auth.name') }}</label>
          <div class="input-wrap">
            <User :size="16" class="input-icon" />
            <input
              v-model="name"
              type="text"
              class="input input-with-icon"
              :placeholder="t('auth.name')"
              autocomplete="name"
            />
          </div>
        </div>

        <div class="form-field">
          <label class="label">{{ t('auth.email') }}</label>
          <div class="input-wrap">
            <Mail :size="16" class="input-icon" />
            <input
              v-model="email"
              type="email"
              class="input input-with-icon"
              :placeholder="t('auth.email')"
              autocomplete="email"
            />
          </div>
        </div>

        <div class="form-field">
          <label class="label">{{ t('auth.password') }}</label>
          <div class="input-wrap">
            <Lock :size="16" class="input-icon" />
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="input input-with-icon"
              :placeholder="t('auth.password')"
              autocomplete="new-password"
            />
            <button type="button" class="input-toggle" @click="showPassword = !showPassword">
              <EyeOff v-if="showPassword" :size="16" />
              <Eye v-else :size="16" />
            </button>
          </div>
        </div>

        <button type="submit" class="btn-accent w-full" :disabled="!canSubmit">
          {{ loading ? t('common.loading') : t('auth.getStarted') }}
        </button>
      </form>

      <div class="auth-divider"><span>{{ t('common.or') }}</span></div>

      <button
        class="btn-google w-full"
        :disabled="googleLoading"
        @click="handleGoogle"
      >
        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        {{ t('auth.googleSignUp') }}
      </button>

      <p class="auth-footer">
        {{ t('auth.hasAccount') }}
        <router-link to="/login" class="auth-link">{{ t('auth.login') }}</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  padding: 24px; position: relative; overflow: hidden;
  background: linear-gradient(to bottom, #f0e6ff, #fff, #fff0f5);
}
.auth-bg { position: absolute; inset: 0; pointer-events: none; }
.heart { position: absolute; color: rgba(200,150,180,0.15); animation: float 3s ease-in-out infinite; }
.heart-1 { top: 12%; left: 10%; animation-delay: 0s; }
.heart-2 { top: 30%; right: 10%; animation-delay: 0.5s; }
.heart-3 { bottom: 25%; left: 18%; animation-delay: 1s; }
.heart-4 { bottom: 12%; right: 15%; animation-delay: 1.5s; }
.heart-5 { top: 55%; left: 45%; animation-delay: 2s; }
@keyframes float {
  0%, 100% { opacity: 0.3; transform: translateY(0); }
  50% { opacity: 0.7; transform: translateY(-10px); }
}
.auth-card {
  width: 100%; max-width: 400px; background: rgba(255,255,255,0.85);
  backdrop-filter: blur(20px); border-radius: var(--radius-lg);
  padding: 36px; box-shadow: 0 12px 48px rgba(155,142,200,0.12);
  position: relative; z-index: 1;
}
.auth-hero { text-align: center; margin-bottom: 28px; }
.hero-circles { position: relative; width: 80px; height: 80px; margin: 0 auto 16px; }
.hero-circle { position: absolute; border-radius: 50%; }
.hero-circle-outer { inset: 0; background: linear-gradient(135deg, #fff0f5, #fce7f3); }
.hero-circle-inner {
  inset: 12px; background: linear-gradient(135deg, #f472b6, #ec4899);
  display: flex; align-items: center; justify-content: center; color: #fff;
}
.auth-title {
  font-size: 26px; font-weight: 800;
  background: linear-gradient(to right, #9B8EC8, #B4A5D6);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.auth-subtitle { font-size: 14px; color: var(--c-txt-muted); margin-top: 4px; }
.auth-form { display: flex; flex-direction: column; gap: 16px; }
.form-field { display: flex; flex-direction: column; }
.input-wrap { position: relative; display: flex; align-items: center; }
.input-icon { position: absolute; left: 14px; color: var(--c-txt-muted); pointer-events: none; z-index: 1; }
.input-with-icon { padding-left: 40px; }
.input-toggle {
  position: absolute; right: 12px; color: var(--c-txt-muted);
  display: flex; align-items: center; padding: 4px;
}
.input-toggle:hover { color: var(--c-primary); }
.btn-accent {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  color: #fff; font-weight: 600; padding: 12px 24px; border-radius: var(--radius-md);
  background: linear-gradient(to right, #f472b6, #ec4899);
  box-shadow: 0 4px 16px -4px rgba(236,72,153,0.3);
  transition: all var(--transition); font-size: 14px;
}
.btn-accent:hover { box-shadow: 0 6px 24px -4px rgba(236,72,153,0.45); }
.btn-accent:disabled { opacity: 0.5; cursor: not-allowed; }
.auth-divider {
  display: flex; align-items: center; gap: 12px;
  margin: 20px 0; color: var(--c-txt-muted); font-size: 13px;
}
.auth-divider::before, .auth-divider::after {
  content: ''; flex: 1; height: 1px; background: var(--c-border);
}
.btn-google {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  padding: 12px 24px; border-radius: var(--radius-md);
  border: 1px solid #e5e7eb; font-weight: 600; font-size: 14px;
  color: var(--c-txt); background: #fff; transition: all var(--transition);
}
.btn-google:hover { background: #f9fafb; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.auth-footer {
  text-align: center; margin-top: 20px; font-size: 14px; color: var(--c-txt-secondary);
}
.auth-link { color: var(--c-primary); font-weight: 600; }
.auth-link:hover { text-decoration: underline; }
.alert-warming {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; border-radius: var(--radius-md);
  background: #fef3c7; border: 1px solid #fde68a;
}
.warming-spinner {
  width: 22px; height: 22px; flex-shrink: 0;
  border: 3px solid #d97706; border-top-color: transparent;
  border-radius: 50%; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.warming-title { font-weight: 600; font-size: 14px; color: #92400e; }
.warming-hint { font-size: 12px; color: #a16207; margin-top: 2px; }
.btn-retry {
  font-size: 13px; font-weight: 600; color: #92400e;
  padding: 6px 14px; border-radius: var(--radius-md);
  border: 1px solid #d97706; background: #fffbeb;
  transition: all var(--transition); cursor: pointer;
}
.btn-retry:hover { background: #fef3c7; }
</style>
