import { tokenStorage } from './api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Resolve a photo URL from the API.
 * - data: URIs and http(s) URLs are used as-is
 * - Relative API paths (e.g. /pets/5/photo) are resolved with API_BASE + auth token
 */
export function resolvePhotoUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('data:') || url.startsWith('http')) return url;
  const token = tokenStorage.get();
  const sep = url.includes('?') ? '&' : '?';
  return `${API_BASE}${url}${token ? `${sep}token=${token}` : ''}`;
}
