import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi, tokenStorage, checkBackend } from '@/lib/api';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { User } from '@/lib/types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(true);
  const backendReachable = ref(false);
  const googleAvailable = computed(() => isSupabaseConfigured && backendReachable.value);

  async function init() {
    const ok = await checkBackend();
    backendReachable.value = ok;
    if (ok) {
      const stored = tokenStorage.get();
      if (stored) {
        try {
          user.value = await authApi.me();
        } catch {
          try {
            const res = await authApi.refresh();
            tokenStorage.set(res.access_token);
            if (res.refresh_token) tokenStorage.setRefresh(res.refresh_token);
            user.value = res.user;
          } catch {
            tokenStorage.clear();
          }
        }
      }
    }
    loading.value = false;

    // Listen for Supabase auth callback (Google OAuth redirect)
    const sb = getSupabase();
    if (!isSupabaseConfigured || !sb) return;
    sb.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        if (tokenStorage.get()) return;
        const email = session.user.email || '';
        const name =
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          email.split('@')[0];
        try {
          const res = await authApi.google({ email, name, supabase_token: session.access_token });
          tokenStorage.set(res.access_token);
          if (res.refresh_token) tokenStorage.setRefresh(res.refresh_token);
          user.value = res.user;
        } catch (e) {
          console.error('Failed to sync Google user with backend:', e);
        }
      }
    });
  }

  async function login(email: string, password: string) {
    const res = await authApi.login({ email, password });
    tokenStorage.set(res.access_token);
    if (res.refresh_token) tokenStorage.setRefresh(res.refresh_token);
    user.value = res.user;
  }

  async function register(name: string, email: string, password: string) {
    const res = await authApi.register({ name, email, password });
    tokenStorage.set(res.access_token);
    if (res.refresh_token) tokenStorage.setRefresh(res.refresh_token);
    user.value = res.user;
  }

  async function loginWithGoogle() {
    const sb = getSupabase();
    if (!isSupabaseConfigured || !sb) throw new Error('Google Sign-In not configured');
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/login' },
    });
    if (error) throw new Error(error.message);
  }

  function logout() {
    tokenStorage.clear();
    getSupabase()?.auth.signOut().catch(() => {});
    user.value = null;
  }

  async function refreshUser() {
    try {
      user.value = await authApi.me();
    } catch { /* ignore */ }
  }

  return { user, loading, backendReachable, googleAvailable, init, login, register, loginWithGoogle, logout, refreshUser };
});
