import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { tokenStorage, authApi, enableDemoMode, disableDemoMode, isDemoMode } from '../api';
import { supabase, OAUTH_REDIRECT_URL } from '../api/supabase';
import { DEMO_USER } from '../api/demo-data';
import { API_BASE_URL } from '../api/config';
import type { User } from '../api/types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  demoMode: boolean;
  backendReachable: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  enterDemoMode: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  token: null,
  loading: true,
  demoMode: false,
  backendReachable: false,
  login: async () => {},
  register: async () => {},
  loginWithGoogle: async () => {},
  enterDemoMode: () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [backendReachable, setBackendReachable] = useState(false);

  // Sync Supabase Google user with our backend
  const handleSupabaseUser = useCallback(async (supabaseToken: string, email: string, name: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, supabase_token: supabaseToken }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Google login failed' }));
      throw new Error(err.detail);
    }
    const data = await res.json();
    await tokenStorage.set(data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  }, []);

  // On mount: check backend, restore session, listen for Supabase auth
  useEffect(() => {
    (async () => {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 2000);
        try {
          await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
          clearTimeout(timer);
          setBackendReachable(true);

          // Try to restore stored session
          const stored = await tokenStorage.get();
          if (stored) {
            setToken(stored);
            try {
              const me = await authApi.me();
              setUser(me);
            } catch {
              await tokenStorage.clear();
            }
          }
        } catch {
          clearTimeout(timer);
          setBackendReachable(false);
        }
      } finally {
        setLoading(false);
      }
    })();

    // Listen for Supabase auth state changes (Google OAuth callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
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

    return () => {
      subscription.unsubscribe();
    };
  }, [handleSupabaseUser]);

  const login = useCallback(async (email: string, password: string) => {
    if (isDemoMode()) {
      setToken('demo-token');
      setUser(DEMO_USER);
      return;
    }
    const res = await authApi.login({ email, password });
    await tokenStorage.set(res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    if (isDemoMode()) {
      setToken('demo-token');
      setUser({ ...DEMO_USER, name, email });
      return;
    }
    const res = await authApi.register({ name, email, password });
    await tokenStorage.set(res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: OAUTH_REDIRECT_URL,
      },
    });
    if (error) throw new Error(error.message);
  }, []);

  const enterDemoMode = useCallback(() => {
    enableDemoMode();
    setDemoMode(true);
    setToken('demo-token');
    setUser(DEMO_USER);
  }, []);

  const logout = useCallback(async () => {
    await tokenStorage.clear();
    await supabase.auth.signOut().catch(() => {});
    disableDemoMode();
    setToken(null);
    setUser(null);
    setDemoMode(false);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, token, loading, demoMode, backendReachable,
      login, register, loginWithGoogle, enterDemoMode, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
