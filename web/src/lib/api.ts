import type {
  TokenResponse, User, Pet, PetCreate, PetDashboard,
  FeedingLog, FeedingCreate, WaterLog, WaterCreate,
  Vaccine, VaccineCreate, Medication, MedicationCreate,
  PetEvent, EventCreate, Symptom, SymptomCreate,
  WeightLog, WeightCreate,
} from './types';

// All API calls go through the Next.js proxy (/api/*) to avoid CORS issues.
// The proxy destination is configured in next.config.js rewrites().
const API_BASE = '/api';

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
function readAsDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// ── HTTP client ──
const REQUEST_TIMEOUT_MS = 30_000;

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = tokenStorage.get();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: `Error ${res.status}` }));
      throw new Error(err.detail || `Error ${res.status}`);
    }

    if (res.status === 204) return undefined as unknown as T;
    return res.json();
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
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
  uploadPhoto: async (file: File) => {
    const dataUri = await readAsDataUri(file);
    return request<User>('PUT', '/auth/photo', { photo_data: dataUri });
  },
  deletePhoto: () => request<User>('DELETE', '/auth/photo'),
  changePassword: (data: { current_password: string; new_password: string }) =>
    request<User>('PUT', '/auth/password', data),
  deleteAccount: () => request<void>('DELETE', '/auth/account'),
};

// ── Pets API ──
export const petsApi = {
  list: () => request<Pet[]>('GET', '/pets/'),
  create: (data: PetCreate) => request<Pet>('POST', '/pets/', data),
  get: (id: number) => request<Pet>('GET', `/pets/${id}`),
  update: (id: number, data: Partial<PetCreate>) => request<Pet>('PUT', `/pets/${id}`, data),
  delete: (id: number) => request<void>('DELETE', `/pets/${id}`),
  today: (id: number) => request<PetDashboard>('GET', `/pets/${id}/today`),
  uploadPhoto: async (id: number, file: File) => {
    const dataUri = await readAsDataUri(file);
    return request<Pet>('PUT', `/pets/${id}`, { photo_url: dataUri });
  },
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
    const timer = setTimeout(() => ctrl.abort(), 2000);
    await fetch(`${API_BASE}/health`, { signal: ctrl.signal });
    clearTimeout(timer);
    return true;
  } catch {
    return false;
  }
}
