import type {
  TokenResponse, User, Pet, PetCreate, PetDashboard,
  FeedingLog, FeedingCreate, WaterLog, WaterCreate,
  Vaccine, VaccineCreate, Medication, MedicationCreate,
  PetEvent, EventCreate, Symptom, SymptomCreate,
  WeightLog, WeightCreate,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ── Token storage ──
let _token: string | null = null;

export const tokenStorage = {
  get(): string | null {
    if (_token) return _token;
    if (typeof window !== 'undefined') {
      _token = localStorage.getItem('pwelltrack_token');
    }
    return _token;
  },
  set(token: string) {
    _token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('pwelltrack_token', token);
    }
  },
  clear() {
    _token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pwelltrack_token');
    }
  },
};

// ── Helpers ──

/**
 * Compress image and upload to Supabase Storage (CDN).
 * Falls back to base64 data URI if Supabase is not configured or upload fails.
 * Returns a URL string (either https://...supabase... or data:image/...).
 */
let _supabaseStorageBroken = false; // skip Supabase after first RLS / permission failure

export async function preparePhoto(file: File): Promise<string> {
  const { compressImage } = await import('./photos');
  const compressed = await compressImage(file);

  // Try Supabase Storage first (browser → Supabase CDN, bypasses Render entirely)
  if (!_supabaseStorageBroken) {
    try {
      const { getSupabase } = await import('./supabase');
      const supabase = getSupabase();
      if (supabase) {
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
        const { data, error } = await supabase.storage
          .from('photos')
          .upload(fileName, compressed, { contentType: 'image/jpeg', upsert: true });

        if (!error && data) {
          const { data: urlData } = supabase.storage.from('photos').getPublicUrl(data.path);
          if (urlData?.publicUrl) {
            console.info('[Storage] Photo uploaded to Supabase CDN:', urlData.publicUrl);
            return urlData.publicUrl;
          }
        }
        // RLS or permission error — don't retry Supabase for the rest of this session
        if (error?.message?.includes('row-level security') || error?.message?.includes('policy')) {
          _supabaseStorageBroken = true;
          console.warn('[Storage] Supabase Storage has RLS issues, using base64 for this session');
        } else {
          console.warn('[Storage] Supabase upload failed:', error?.message);
        }
      } else {
        console.info('[Storage] Supabase not configured, using base64');
      }
    } catch (e: any) {
      console.warn('[Storage] Supabase error:', e?.message);
    }
  }

  // Fallback: base64 data URI (sent inside JSON body to backend)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      console.info('[Storage] Using base64 fallback, size:', Math.round(result.length / 1024), 'KB');
      resolve(result);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(compressed);
  });
}

// ── HTTP client ──
const REQUEST_TIMEOUT_MS = 60_000;
const MAX_RETRIES = 2;
const RETRY_DELAYS = [2_000, 5_000];

function isNetworkError(e: unknown): boolean {
  if (e instanceof TypeError && /network|fetch|failed/i.test((e as TypeError).message)) return true;
  if (e instanceof DOMException && e.name === 'NetworkError') return true;
  return false;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = tokenStorage.get();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const jsonBody = body ? JSON.stringify(body) : undefined;

  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = RETRY_DELAYS[attempt - 1] ?? 5_000;
      console.warn(`[API] Retry ${attempt}/${MAX_RETRIES} for ${method} ${path} after ${delay}ms`);
      await new Promise(r => setTimeout(r, delay));
    }

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: jsonBody,
        signal: ctrl.signal,
        mode: 'cors',
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: `Error ${res.status}` }));
        throw new Error(err.detail || `Error ${res.status}`);
      }

      if (res.status === 204) return undefined as unknown as T;
      return res.json();
    } catch (e: any) {
      lastError = e;
      clearTimeout(timer);

      if (e instanceof DOMException && e.name === 'AbortError') {
        throw new Error('Request timed out');
      }

      // Retry on network errors (Render cold start can drop connections)
      if (isNetworkError(e) && attempt < MAX_RETRIES) {
        console.warn(`[API] Network error on ${method} ${path}:`, e?.message);
        continue;
      }

      console.error(`[API] ${method} ${path} failed:`, e?.message || e, { url, bodySize: jsonBody?.length ?? 0 });
      throw e;
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError;
}

function buildListPath(base: string, dateFrom?: string, dateTo?: string): string {
  const params = new URLSearchParams();
  if (dateFrom) params.set('date_from', dateFrom);
  if (dateTo) params.set('date_to', dateTo);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

// ── Auth API ──
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    request<TokenResponse>('POST', '/auth/register', data),
  login: (data: { email: string; password: string }) =>
    request<TokenResponse>('POST', '/auth/login', data),
  me: () => request<User>('GET', '/auth/me'),
  refresh: () => request<TokenResponse>('POST', '/auth/refresh'),
  google: (data: { email: string; name: string; supabase_token: string }) =>
    request<TokenResponse>('POST', '/auth/google', data),
  /** Upload user photo — uploads to Supabase Storage or falls back to base64 */
  uploadPhoto: async (file: File) => {
    const photoUrl = await preparePhoto(file);
    return request<User>('PUT', '/auth/photo', { photo_data: photoUrl });
  },
  deletePhoto: () => request<User>('DELETE', '/auth/photo'),
  changePassword: (data: { current_password: string; new_password: string }) =>
    request<User>('PUT', '/auth/password', data),
  deleteAccount: () => request<void>('DELETE', '/auth/account'),
};

// ── Pets API ──
export const petsApi = {
  list: () => request<Pet[]>('GET', '/pets/'),
  /** Create pet — pass photo_url as data URI to include photo in creation */
  create: (data: PetCreate) => request<Pet>('POST', '/pets/', data),
  get: (id: number) => request<Pet>('GET', `/pets/${id}`),
  /** Update pet — pass photo_url as data URI to change photo */
  update: (id: number, data: Partial<PetCreate>) => request<Pet>('PUT', `/pets/${id}`, data),
  delete: (id: number) => request<void>('DELETE', `/pets/${id}`),
  today: (id: number) => request<PetDashboard>('GET', `/pets/${id}/today`),
  deletePhoto: (id: number) => request<Pet>('DELETE', `/pets/${id}/photo`),
};

// ── Feeding API ──
export const feedingApi = {
  list: (petId: number, dateFrom?: string, dateTo?: string) =>
    request<FeedingLog[]>('GET', buildListPath(`/pets/${petId}/feeding`, dateFrom, dateTo)),
  create: (petId: number, data: FeedingCreate) => request<FeedingLog>('POST', `/pets/${petId}/feeding`, data),
  update: (id: number, data: Partial<FeedingCreate>) => request<FeedingLog>('PUT', `/feeding/${id}`, data),
  delete: (id: number) => request<void>('DELETE', `/feeding/${id}`),
};

// ── Water API ──
export const waterApi = {
  list: (petId: number, dateFrom?: string, dateTo?: string) =>
    request<WaterLog[]>('GET', buildListPath(`/pets/${petId}/water`, dateFrom, dateTo)),
  create: (petId: number, data: WaterCreate) => request<WaterLog>('POST', `/pets/${petId}/water`, data),
  update: (id: number, data: Partial<WaterCreate>) => request<WaterLog>('PUT', `/water/${id}`, data),
  delete: (id: number) => request<void>('DELETE', `/water/${id}`),
};

// ── Vaccines API ──
export const vaccinesApi = {
  list: (petId: number, dateFrom?: string, dateTo?: string) =>
    request<Vaccine[]>('GET', buildListPath(`/pets/${petId}/vaccines`, dateFrom, dateTo)),
  create: (petId: number, data: VaccineCreate) => request<Vaccine>('POST', `/pets/${petId}/vaccines`, data),
  update: (id: number, data: Partial<VaccineCreate>) => request<Vaccine>('PUT', `/vaccines/${id}`, data),
  delete: (id: number) => request<void>('DELETE', `/vaccines/${id}`),
};

// ── Medications API ──
export const medicationsApi = {
  list: (petId: number, dateFrom?: string, dateTo?: string) =>
    request<Medication[]>('GET', buildListPath(`/pets/${petId}/medications`, dateFrom, dateTo)),
  create: (petId: number, data: MedicationCreate) => request<Medication>('POST', `/pets/${petId}/medications`, data),
  update: (id: number, data: Partial<MedicationCreate>) => request<Medication>('PUT', `/medications/${id}`, data),
  delete: (id: number) => request<void>('DELETE', `/medications/${id}`),
};

// ── Events API ──
export const eventsApi = {
  list: (petId: number, dateFrom?: string, dateTo?: string) =>
    request<PetEvent[]>('GET', buildListPath(`/pets/${petId}/events`, dateFrom, dateTo)),
  create: (petId: number, data: EventCreate) => request<PetEvent>('POST', `/pets/${petId}/events`, data),
  update: (id: number, data: Partial<EventCreate>) => request<PetEvent>('PUT', `/events/${id}`, data),
  delete: (id: number) => request<void>('DELETE', `/events/${id}`),
};

// ── Symptoms API ──
export const symptomsApi = {
  list: (petId: number, dateFrom?: string, dateTo?: string) =>
    request<Symptom[]>('GET', buildListPath(`/pets/${petId}/symptoms`, dateFrom, dateTo)),
  create: (petId: number, data: SymptomCreate) => request<Symptom>('POST', `/pets/${petId}/symptoms`, data),
  update: (id: number, data: Partial<SymptomCreate>) => request<Symptom>('PUT', `/symptoms/${id}`, data),
  delete: (id: number) => request<void>('DELETE', `/symptoms/${id}`),
};

// ── Weight API ──
export const weightApi = {
  list: (petId: number, dateFrom?: string, dateTo?: string) =>
    request<WeightLog[]>('GET', buildListPath(`/pets/${petId}/weight`, dateFrom, dateTo)),
  create: (petId: number, data: WeightCreate) => request<WeightLog>('POST', `/pets/${petId}/weight`, data),
  update: (id: number, data: Partial<WeightCreate>) => request<WeightLog>('PUT', `/weight/${id}`, data),
  delete: (id: number) => request<void>('DELETE', `/weight/${id}`),
};

// ── Health check ──
export async function checkBackend(): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10_000);
    await fetch(`${API_BASE}/health`, { signal: ctrl.signal, mode: 'cors' });
    clearTimeout(timer);
    return true;
  } catch {
    return false;
  }
}
