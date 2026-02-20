import { api, isDemoMode, uploadPetPhoto, tokenStorage } from './client';
import {
  DEMO_TOKEN, DEMO_USER, DEMO_PETS, DEMO_FEEDING, DEMO_WATER,
  DEMO_VACCINES, DEMO_MEDICATIONS, DEMO_EVENTS, DEMO_SYMPTOMS,
  getDemoDashboard, getDemoSummary,
} from './demo-data';
import type {
  TokenResponse, User,
  Pet, PetCreate, PetSummaryItem,
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
  register: (data: { name: string; email: string; password: string }): Promise<TokenResponse> =>
    isDemoMode() ? Promise.resolve(DEMO_TOKEN) : api.post('/auth/register', data),
  login: (data: { email: string; password: string }): Promise<TokenResponse> =>
    isDemoMode() ? Promise.resolve(DEMO_TOKEN) : api.post('/auth/login', data),
  me: (): Promise<User> =>
    isDemoMode() ? Promise.resolve(DEMO_USER) : api.get('/auth/me'),
  refresh: async (): Promise<TokenResponse> => {
    if (isDemoMode()) return DEMO_TOKEN;
    const rt = await tokenStorage.getRefresh();
    if (!rt) throw new Error('No refresh token');
    return api.post('/auth/refresh', { refresh_token: rt });
  },
};

// ── Pets ──
export const petsApi = {
  list: (): Promise<Pet[]> =>
    isDemoMode() ? Promise.resolve(DEMO_PETS) : api.get('/pets/'),
  summary: (): Promise<PetSummaryItem[]> =>
    isDemoMode() ? Promise.resolve(getDemoSummary()) : api.get('/pets/summary'),
  create: (data: PetCreate): Promise<Pet> =>
    isDemoMode()
      ? Promise.resolve({ ...DEMO_PETS[0], ...data, id: Date.now() } as Pet)
      : api.post('/pets/', data),
  get: (id: number): Promise<Pet> =>
    isDemoMode()
      ? Promise.resolve(DEMO_PETS.find(p => p.id === id) ?? DEMO_PETS[0])
      : api.get(`/pets/${id}`),
  update: (id: number, data: Partial<PetCreate>): Promise<Pet> =>
    isDemoMode()
      ? Promise.resolve({ ...(DEMO_PETS.find(p => p.id === id) ?? DEMO_PETS[0]), ...data } as Pet)
      : api.put(`/pets/${id}`, data),
  delete: (id: number): Promise<void> =>
    isDemoMode() ? Promise.resolve() : api.delete(`/pets/${id}`),
  today: (id: number): Promise<PetDashboard> =>
    isDemoMode() ? Promise.resolve(getDemoDashboard(id)) : api.get(`/pets/${id}/today`),
  uploadPhoto: (petId: number, uri: string): Promise<Pet> =>
    isDemoMode()
      ? Promise.resolve({ ...DEMO_PETS[0], photo_url: uri } as Pet)
      : uploadPetPhoto(petId, uri),
};

// ── Feeding ──
export const feedingApi = {
  list: (petId: number, dateFrom?: string): Promise<FeedingLog[]> =>
    isDemoMode()
      ? Promise.resolve(DEMO_FEEDING[petId] ?? [])
      : api.get(`/pets/${petId}/feeding`, dateFrom ? { date_from: dateFrom } : undefined),
  create: (petId: number, data: FeedingCreate): Promise<FeedingLog> =>
    isDemoMode()
      ? Promise.resolve({ id: Date.now(), pet_id: petId, datetime: new Date().toISOString(), ...data, planned_amount_grams: data.planned_amount_grams ?? null, notes: data.notes ?? null } as FeedingLog)
      : api.post(`/pets/${petId}/feeding`, data),
  update: (id: number, data: Partial<FeedingCreate>): Promise<FeedingLog> =>
    isDemoMode()
      ? Promise.resolve({ id, pet_id: 0, datetime: new Date().toISOString(), food_type: '', actual_amount_grams: 0, planned_amount_grams: null, notes: null, ...data } as FeedingLog)
      : api.put(`/feeding/${id}`, data),
  delete: (id: number): Promise<void> =>
    isDemoMode() ? Promise.resolve() : api.delete(`/feeding/${id}`),
};

// ── Water ──
export const waterApi = {
  list: (petId: number): Promise<WaterLog[]> =>
    isDemoMode() ? Promise.resolve(DEMO_WATER[petId] ?? []) : api.get(`/pets/${petId}/water`),
  create: (petId: number, data: WaterCreate): Promise<WaterLog> =>
    isDemoMode()
      ? Promise.resolve({ id: Date.now(), pet_id: petId, datetime: new Date().toISOString(), ...data, daily_goal_ml: data.daily_goal_ml ?? null } as WaterLog)
      : api.post(`/pets/${petId}/water`, data),
  update: (id: number, data: Partial<WaterCreate>): Promise<WaterLog> =>
    isDemoMode()
      ? Promise.resolve({ id, pet_id: 0, datetime: new Date().toISOString(), amount_ml: 0, daily_goal_ml: null, ...data } as WaterLog)
      : api.put(`/water/${id}`, data),
  delete: (id: number): Promise<void> =>
    isDemoMode() ? Promise.resolve() : api.delete(`/water/${id}`),
};

// ── Vaccines ──
export const vaccinesApi = {
  list: (petId: number): Promise<Vaccine[]> =>
    isDemoMode() ? Promise.resolve(DEMO_VACCINES[petId] ?? []) : api.get(`/pets/${petId}/vaccines`),
  create: (petId: number, data: VaccineCreate): Promise<Vaccine> =>
    isDemoMode()
      ? Promise.resolve({ id: Date.now(), pet_id: petId, ...data, next_due_date: data.next_due_date ?? null, clinic: data.clinic ?? null, notes: data.notes ?? null, document_url: data.document_url ?? null } as Vaccine)
      : api.post(`/pets/${petId}/vaccines`, data),
  update: (id: number, data: Partial<VaccineCreate>): Promise<Vaccine> =>
    isDemoMode()
      ? Promise.resolve({ id, pet_id: 0, name: '', date_administered: '', next_due_date: null, clinic: null, notes: null, document_url: null, ...data } as Vaccine)
      : api.put(`/vaccines/${id}`, data),
  delete: (id: number): Promise<void> =>
    isDemoMode() ? Promise.resolve() : api.delete(`/vaccines/${id}`),
};

// ── Medications ──
export const medicationsApi = {
  list: (petId: number): Promise<Medication[]> =>
    isDemoMode() ? Promise.resolve(DEMO_MEDICATIONS[petId] ?? []) : api.get(`/pets/${petId}/medications`),
  create: (petId: number, data: MedicationCreate): Promise<Medication> =>
    isDemoMode()
      ? Promise.resolve({ id: Date.now(), pet_id: petId, ...data, end_date: data.end_date ?? null, times_of_day: data.times_of_day ?? null, notes: data.notes ?? null } as Medication)
      : api.post(`/pets/${petId}/medications`, data),
  update: (id: number, data: Partial<MedicationCreate>): Promise<Medication> =>
    isDemoMode()
      ? Promise.resolve({ id, pet_id: 0, name: '', dosage: '', frequency_per_day: 1, start_date: '', end_date: null, times_of_day: null, notes: null, ...data } as Medication)
      : api.put(`/medications/${id}`, data),
  delete: (id: number): Promise<void> =>
    isDemoMode() ? Promise.resolve() : api.delete(`/medications/${id}`),
};

// ── Events ──
export const eventsApi = {
  list: (petId: number): Promise<PetEvent[]> =>
    isDemoMode() ? Promise.resolve(DEMO_EVENTS[petId] ?? []) : api.get(`/pets/${petId}/events`),
  create: (petId: number, data: EventCreate): Promise<PetEvent> =>
    isDemoMode()
      ? Promise.resolve({ id: Date.now(), pet_id: petId, ...data, duration_minutes: data.duration_minutes ?? null, location: data.location ?? null, notes: data.notes ?? null, reminder_minutes_before: data.reminder_minutes_before ?? null } as PetEvent)
      : api.post(`/pets/${petId}/events`, data),
  update: (id: number, data: Partial<EventCreate>): Promise<PetEvent> =>
    isDemoMode()
      ? Promise.resolve({ id, pet_id: 0, type: '', title: '', datetime_start: '', duration_minutes: null, location: null, notes: null, reminder_minutes_before: null, ...data } as PetEvent)
      : api.put(`/events/${id}`, data),
  delete: (id: number): Promise<void> =>
    isDemoMode() ? Promise.resolve() : api.delete(`/events/${id}`),
};

// ── Symptoms ──
export const symptomsApi = {
  list: (petId: number): Promise<Symptom[]> =>
    isDemoMode() ? Promise.resolve(DEMO_SYMPTOMS[petId] ?? []) : api.get(`/pets/${petId}/symptoms`),
  create: (petId: number, data: SymptomCreate): Promise<Symptom> =>
    isDemoMode()
      ? Promise.resolve({ id: Date.now(), pet_id: petId, datetime: new Date().toISOString(), ...data, notes: data.notes ?? null } as Symptom)
      : api.post(`/pets/${petId}/symptoms`, data),
  update: (id: number, data: Partial<SymptomCreate>): Promise<Symptom> =>
    isDemoMode()
      ? Promise.resolve({ id, pet_id: 0, datetime: new Date().toISOString(), type: '', severity: 'mild', notes: null, ...data } as Symptom)
      : api.put(`/symptoms/${id}`, data),
  delete: (id: number): Promise<void> =>
    isDemoMode() ? Promise.resolve() : api.delete(`/symptoms/${id}`),
};
