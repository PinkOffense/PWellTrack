import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@pwelltrack_cache_';
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export const offlineCache = {
  async set<T>(key: string, data: T): Promise<void> {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  },

  async get<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;

    try {
      const entry: CacheEntry<T> = JSON.parse(raw);
      // Check if cache is still valid
      if (Date.now() - entry.timestamp > CACHE_TTL) {
        await AsyncStorage.removeItem(CACHE_PREFIX + key);
        return null;
      }
      return entry.data;
    } catch {
      return null;
    }
  },

  async invalidate(key: string): Promise<void> {
    await AsyncStorage.removeItem(CACHE_PREFIX + key);
  },

  async invalidateAll(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  },
};

// Wrapper that tries API first, falls back to cache
export async function fetchWithCache<T>(
  cacheKey: string,
  apiFn: () => Promise<T>,
): Promise<T> {
  try {
    const data = await apiFn();
    // Cache the successful response
    await offlineCache.set(cacheKey, data);
    return data;
  } catch (error) {
    // Try cache on failure
    const cached = await offlineCache.get<T>(cacheKey);
    if (cached !== null) {
      return cached;
    }
    throw error;
  }
}
