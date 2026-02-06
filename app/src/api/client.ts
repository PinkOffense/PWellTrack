import { Platform } from 'react-native';
import { API_BASE_URL } from './config';

let _token: string | null = null;
let _demoMode = false;

/** Returns true when the app is running without a backend (e.g. GitHub Pages). */
export const isDemoMode = () => _demoMode;
export const enableDemoMode = () => { _demoMode = true; };

// Dynamically import storage depending on platform
const getStorage = async () => {
  if (Platform.OS === 'web') {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    return {
      getItem: (key: string) => AsyncStorage.getItem(key),
      setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
      deleteItem: (key: string) => AsyncStorage.removeItem(key),
    };
  }
  const SecureStore = await import('expo-secure-store');
  return {
    getItem: (key: string) => SecureStore.getItemAsync(key),
    setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
    deleteItem: (key: string) => SecureStore.deleteItemAsync(key),
  };
};

export const tokenStorage = {
  async get(): Promise<string | null> {
    if (_token) return _token;
    const storage = await getStorage();
    _token = await storage.getItem('jwt_token');
    return _token;
  },
  async set(token: string): Promise<void> {
    _token = token;
    const storage = await getStorage();
    await storage.setItem('jwt_token', token);
  },
  async clear(): Promise<void> {
    _token = null;
    const storage = await getStorage();
    await storage.deleteItem('jwt_token');
  },
};

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  body?: unknown;
  params?: Record<string, string>;
}

async function request<T>(method: RequestMethod, path: string, opts?: RequestOptions): Promise<T> {
  const token = await tokenStorage.get();
  let url = `${API_BASE_URL}${path}`;

  if (opts?.params) {
    const qs = new URLSearchParams(opts.params).toString();
    url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: opts?.body ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorBody.detail || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string, params?: Record<string, string>) =>
    request<T>('GET', path, { params }),
  post: <T>(path: string, body: unknown) =>
    request<T>('POST', path, { body }),
  put: <T>(path: string, body: unknown) =>
    request<T>('PUT', path, { body }),
  delete: <T>(path: string) =>
    request<T>('DELETE', path),
};
