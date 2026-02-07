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
  backendReachable: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
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

  // On mount: check if backend is reachable, restore session if possible
  useEffect(() => {
    (async () => {
      try {
        // Quick connectivity check (2s timeout)
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 2000);
        try {
          await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
          clearTimeout(timer);
          setBackendReachable(true);

          // Backend is reachable — try to restore stored session
          const stored = await tokenStorage.get();
          if (stored) {
            setToken(stored);
            try {
              const me = await authApi.me();
              setUser(me);
            } catch {
              // Token expired or invalid
              await tokenStorage.clear();
            }
          }
        } catch {
          clearTimeout(timer);
          // Backend unreachable — enable demo mode flag but DON'T auto-login
          // User will see login screen and can choose "Try Demo"
          setBackendReachable(false);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (isDemoMode()) {
      // In demo mode, any credentials work
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

  const enterDemoMode = useCallback(() => {
    enableDemoMode();
    setDemoMode(true);
    setToken('demo-token');
    setUser(DEMO_USER);
  }, []);

  const logout = useCallback(async () => {
    await tokenStorage.clear();
    setToken(null);
    setUser(null);
    setDemoMode(false);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, token, loading, demoMode, backendReachable,
      login, register, enterDemoMode, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
