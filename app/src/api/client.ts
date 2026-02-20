import { Platform } from 'react-native';
import { API_BASE_URL } from './config';

let _token: string | null = null;
let _refreshToken: string | null = null;
let _demoMode = false;

/** Returns true when the app is running without a backend (e.g. GitHub Pages). */
export const isDemoMode = () => _demoMode;
export const enableDemoMode = () => { _demoMode = true; };
export const disableDemoMode = () => { _demoMode = false; };

// Dynamically import storage depending on platform
// SEC-06: On web, AsyncStorage uses localStorage which is accessible to any JS on the
// same origin. This is an inherent limitation; consider HttpOnly cookies for production web.
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
    _refreshToken = null;
    const storage = await getStorage();
    await storage.deleteItem('jwt_token');
    await storage.deleteItem('jwt_refresh_token');
  },
  async getRefresh(): Promise<string | null> {
    if (_refreshToken) return _refreshToken;
    const storage = await getStorage();
    _refreshToken = await storage.getItem('jwt_refresh_token');
    return _refreshToken;
  },
  async setRefresh(token: string): Promise<void> {
    _refreshToken = token;
    const storage = await getStorage();
    await storage.setItem('jwt_refresh_token', token);
  },
};

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  body?: unknown;
  params?: Record<string, string>;
}

// Prevent concurrent refresh attempts
let _refreshPromise: Promise<void> | null = null;

async function _doRefresh(): Promise<void> {
  const rt = await tokenStorage.getRefresh();
  if (!rt) throw new Error('No refresh token');
  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: rt }),
  });
  if (!res.ok) throw new Error('Refresh failed');
  const data = await res.json();
  await tokenStorage.set(data.access_token);
  if (data.refresh_token) await tokenStorage.setRefresh(data.refresh_token);
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

  // Handle 401 — attempt token refresh and retry once
  if (res.status === 401 && token) {
    try {
      if (!_refreshPromise) {
        _refreshPromise = _doRefresh();
      }
      await _refreshPromise;
      _refreshPromise = null;

      // Retry with fresh token
      const freshToken = await tokenStorage.get();
      const retryHeaders = { ...headers, Authorization: `Bearer ${freshToken}` };
      const retry = await fetch(url, {
        method,
        headers: retryHeaders,
        body: opts?.body ? JSON.stringify(opts.body) : undefined,
      });
      if (retry.ok) {
        if (retry.status === 204) return undefined as T;
        return retry.json();
      }
    } catch {
      _refreshPromise = null;
    }
    // Refresh failed — clear tokens (AuthContext will redirect to login)
    await tokenStorage.clear();
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorBody.detail || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

/**
 * Upload pet photo as base64 data URI via the update endpoint (JSON body).
 * FormData/multipart uploads fail cross-origin on some platforms,
 * so we send the photo as a base64 data URI in JSON instead.
 * Images are compressed to 512px JPEG before upload.
 */
export async function uploadPetPhoto(petId: number, uri: string): Promise<any> {
  let base64Uri = uri;

  // If it's already a data URI, use it directly
  if (!uri.startsWith('data:')) {
    // Compress and resize before converting to base64
    const ImageManipulator = await import('expo-image-manipulator');
    const FileSystem = await import('expo-file-system');

    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 512, height: 512 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
    );
    const base64 = await FileSystem.readAsStringAsync(manipulated.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    base64Uri = `data:image/jpeg;base64,${base64}`;
  }

  // Send via the update pet endpoint as JSON
  return request('PUT', `/pets/${petId}`, { body: { photo_url: base64Uri } });
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
