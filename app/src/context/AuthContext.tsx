import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { tokenStorage, authApi, enableDemoMode, isDemoMode } from '../api';
import { DEMO_USER } from '../api/demo-data';
import { API_BASE_URL } from '../api/config';
import type { User } from '../api/types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  demoMode: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  token: null,
  loading: true,
  demoMode: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  // Try to restore session on mount; fall back to demo mode if backend unreachable
  useEffect(() => {
    (async () => {
      try {
        // Quick connectivity check (1.5s timeout)
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 1500);
        try {
          await fetch(`${API_BASE_URL}/`, { signal: controller.signal });
          clearTimeout(timer);
        } catch {
          clearTimeout(timer);
          // Backend unreachable — enter demo mode
          enableDemoMode();
          setDemoMode(true);
          setToken('demo-token');
          setUser(DEMO_USER);
          setLoading(false);
          return;
        }

        const stored = await tokenStorage.get();
        if (stored) {
          setToken(stored);
          const me = await authApi.me();
          setUser(me);
        }
      } catch {
        await tokenStorage.clear();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    await tokenStorage.set(res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await authApi.register({ name, email, password });
    await tokenStorage.set(res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    await tokenStorage.clear();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, demoMode, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
