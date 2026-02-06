import { api, tokenStorage } from './client';
import type {
  TokenResponse, User,
  Pet, PetCreate,
  FeedingLog, FeedingCreate,
  WaterLog, WaterCreate,
  Vaccine, VaccineCreate,
  Medication, MedicationCreate,
  PetEvent, EventCreate,
  Symptom, SymptomCreate,
  PetDashboard,
} from './types';

// ── Auth ──
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<TokenResponse>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<TokenResponse>('/auth/login', data),
  me: () => api.get<User>('/auth/me'),
};

// ── Pets ──
export const petsApi = {
  list: () => api.get<Pet[]>('/pets/'),
  create: (data: PetCreate) => api.post<Pet>('/pets/', data),
  get: (id: number) => api.get<Pet>(`/pets/${id}`),
  update: (id: number, data: Partial<PetCreate>) => api.put<Pet>(`/pets/${id}`, data),
  delete: (id: number) => api.delete(`/pets/${id}`),
  today: (id: number) => api.get<PetDashboard>(`/pets/${id}/today`),
};

// ── Feeding ──
export const feedingApi = {
  list: (petId: number) => api.get<FeedingLog[]>(`/pets/${petId}/feeding`),
  create: (petId: number, data: FeedingCreate) =>
    api.post<FeedingLog>(`/pets/${petId}/feeding`, data),
};

// ── Water ──
export const waterApi = {
  list: (petId: number) => api.get<WaterLog[]>(`/pets/${petId}/water`),
  create: (petId: number, data: WaterCreate) =>
    api.post<WaterLog>(`/pets/${petId}/water`, data),
};

// ── Vaccines ──
export const vaccinesApi = {
  list: (petId: number) => api.get<Vaccine[]>(`/pets/${petId}/vaccines`),
  create: (petId: number, data: VaccineCreate) =>
    api.post<Vaccine>(`/pets/${petId}/vaccines`, data),
  update: (id: number, data: Partial<VaccineCreate>) =>
    api.put<Vaccine>(`/vaccines/${id}`, data),
};

// ── Medications ──
export const medicationsApi = {
  list: (petId: number) => api.get<Medication[]>(`/pets/${petId}/medications`),
  create: (petId: number, data: MedicationCreate) =>
    api.post<Medication>(`/pets/${petId}/medications`, data),
  update: (id: number, data: Partial<MedicationCreate>) =>
    api.put<Medication>(`/medications/${id}`, data),
};

// ── Events ──
export const eventsApi = {
  list: (petId: number) => api.get<PetEvent[]>(`/pets/${petId}/events`),
  create: (petId: number, data: EventCreate) =>
    api.post<PetEvent>(`/pets/${petId}/events`, data),
};

// ── Symptoms ──
export const symptomsApi = {
  list: (petId: number) => api.get<Symptom[]>(`/pets/${petId}/symptoms`),
  create: (petId: number, data: SymptomCreate) =>
    api.post<Symptom>(`/pets/${petId}/symptoms`, data),
};
