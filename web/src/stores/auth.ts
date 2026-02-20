import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi, tokenStorage, checkBackend } from '@/lib/api';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { User } from '@/lib/types';

// Keep backend alive: ping /health every 10 min while the tab is visible
let keepAliveTimer: ReturnType<typeof setInterval> | null = null;
function startKeepAlive() {
  if (keepAliveTimer) return;
  keepAliveTimer = setInterval(() => {
    if (!document.hidden) checkBackend().catch(() => {});
  }, 10 * 60 * 1000);
}
function stopKeepAlive() {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(true);
  const backendReachable = ref(false);
  /** True while we're retrying to wake a sleeping backend */
  const warming = ref(false);
  const googleAvailable = computed(() => isSupabaseConfigured && backendReachable.value);

  async function init() {
    // Initialize Supabase client FIRST so it starts processing the OAuth
    // redirect hash fragment while we wait for the backend health check.
    const sb = isSupabaseConfigured ? getSupabase() : null;

    // Promise that resolves once Supabase reports its initial session
    // (picks up tokens from the URL hash after Google OAuth redirect).
    let resolveInitial: (session: import('@supabase/supabase-js').Session | null) => void;
    const initialSessionReady = sb
      ? new Promise<import('@supabase/supabase-js').Session | null>((resolve) => {
          resolveInitial = resolve;
          setTimeout(() => resolve(null), 5_000); // safety timeout
        })
      : Promise.resolve(null);

    // Set up a single listener for all Supabase auth events
    if (sb) {
      sb.auth.onAuthStateChange(async (event, session) => {
        if (event === 'INITIAL_SESSION') {
          resolveInitial!(session);
          return;
        }
        // Handle Google sign-in events that happen *after* init (e.g. user
        // clicks "Login with Google" while already on the login page).
        if (event === 'SIGNED_IN' && session?.user && !tokenStorage.get()) {
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

    // Try up to 3 times (total ~90s) to accommodate Render free-tier cold starts
    const MAX_WAKE_ATTEMPTS = 3;
    let ok = false;
    for (let attempt = 1; attempt <= MAX_WAKE_ATTEMPTS; attempt++) {
      if (attempt > 1) warming.value = true;
      ok = await checkBackend();
      if (ok) break;
      if (attempt < MAX_WAKE_ATTEMPTS) {
        warming.value = true;
        // Wait 5s between retries to give the server time to boot
        await new Promise(r => setTimeout(r, 5_000));
      }
    }
    warming.value = false;
    backendReachable.value = ok;

    if (ok) {
      startKeepAlive();
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

      // Await Supabase initial session (Google OAuth redirect)
      if (!user.value && sb) {
        const session = await initialSessionReady;
        if (session?.user) {
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
      }
    }
    loading.value = false;
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
      options: { redirectTo: window.location.origin + '/pets' },
    });
    if (error) throw new Error(error.message);
  }

  function logout() {
    stopKeepAlive();
    tokenStorage.clear();
    getSupabase()?.auth.signOut().catch(() => {});
    user.value = null;
  }

  async function refreshUser() {
    try {
      user.value = await authApi.me();
    } catch (e) {
      console.warn('[Auth] Failed to refresh user:', e instanceof Error ? e.message : e);
    }
  }

  async function retryBackend() {
    warming.value = true;
    const ok = await checkBackend();
    warming.value = false;
    backendReachable.value = ok;
    if (ok) startKeepAlive();
    return ok;
  }

  return { user, loading, backendReachable, warming, googleAvailable, init, login, register, loginWithGoogle, logout, refreshUser, retryBackend };
});
