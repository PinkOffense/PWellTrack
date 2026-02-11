'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { authApi, tokenStorage, checkBackend } from './api';
import type { User } from './types';

interface AuthState {
  user: User | null;
  loading: boolean;
  backendReachable: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  backendReachable: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [backendReachable, setBackendReachable] = useState(false);

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
            tokenStorage.clear();
          }
        }
      }
      setLoading(false);
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    tokenStorage.set(res.access_token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await authApi.register({ name, email, password });
    tokenStorage.set(res.access_token);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, backendReachable, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
