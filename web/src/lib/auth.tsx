'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { authApi, tokenStorage, checkBackend } from './api';
import { getSupabase, isSupabaseConfigured } from './supabase';
import type { User } from './types';

interface AuthState {
  user: User | null;
  loading: boolean;
  backendReachable: boolean;
  googleAvailable: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  backendReachable: false,
  googleAvailable: false,
  login: async () => {},
  register: async () => {},
  loginWithGoogle: async () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [backendReachable, setBackendReachable] = useState(false);

  // Sync Supabase Google user with our backend
  const handleSupabaseUser = useCallback(async (supabaseToken: string, email: string, name: string) => {
    const res = await authApi.google({ email, name, supabase_token: supabaseToken });
    tokenStorage.set(res.access_token);
    if (res.refresh_token) tokenStorage.setRefresh(res.refresh_token);
    setUser(res.user);
  }, []);

  useEffect(() => {
    (async () => {
      const ok = await checkBackend();
      setBackendReachable(ok);
      if (ok) {
        const stored = tokenStorage.get();
        if (stored) {
          try {
            const me = await authApi.me();
            setUser(me);
          } catch {
            // Access token expired — try refresh
            try {
              const res = await authApi.refresh();
              tokenStorage.set(res.access_token);
              if (res.refresh_token) tokenStorage.setRefresh(res.refresh_token);
              setUser(res.user);
            } catch {
              tokenStorage.clear();
            }
          }
        }
      }
      setLoading(false);
    })();

    // Listen for Supabase auth callback (Google OAuth redirect)
    const sb = getSupabase();
    if (!isSupabaseConfigured || !sb) return;
    const { data: { subscription } } = sb.auth.onAuthStateChange(async (event, session) => {
      // Handle both SIGNED_IN (new login) and INITIAL_SESSION (page reload after redirect)
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        // Skip if we already have a user from stored token
        if (tokenStorage.get()) return;
        const email = session.user.email || '';
        const name =
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          email.split('@')[0];
        try {
          await handleSupabaseUser(session.access_token, email, name);
        } catch (e) {
          console.error('Failed to sync Google user with backend:', e);
        }
      }
    });

    return () => { subscription.unsubscribe(); };
  }, [handleSupabaseUser]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    tokenStorage.set(res.access_token);
    if (res.refresh_token) tokenStorage.setRefresh(res.refresh_token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await authApi.register({ name, email, password });
    tokenStorage.set(res.access_token);
    if (res.refresh_token) tokenStorage.setRefresh(res.refresh_token);
    setUser(res.user);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const sb = getSupabase();
    if (!isSupabaseConfigured || !sb) {
      throw new Error('Google Sign-In not configured');
    }
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/login',
      },
    });
    if (error) throw new Error(error.message);
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    getSupabase()?.auth.signOut().catch(() => {});
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const me = await authApi.me();
      setUser(me);
    } catch { /* ignore */ }
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading, backendReachable,
      googleAvailable: isSupabaseConfigured && backendReachable,
      login, register, loginWithGoogle, logout, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
