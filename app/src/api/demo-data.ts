/**
 * Demo / offline data for GitHub Pages deployment.
 * When the backend is unreachable the app falls back to this mock data
 * so users can explore the UI.
 */

import type {
  User, TokenResponse, Pet, FeedingLog, WaterLog,
  Vaccine, Medication, PetEvent, Symptom, PetDashboard,
} from './types';

const now = new Date().toISOString();
const today = new Date().toISOString().slice(0, 10);

export const DEMO_USER: User = {
  id: 1, name: 'Demo User', email: 'demo@pwelltrack.app',
  timezone: 'America/Sao_Paulo', created_at: now,
};

export const DEMO_TOKEN: TokenResponse = {
  access_token: 'demo-token',
  refresh_token: 'demo-refresh-token',
  token_type: 'bearer',
  user: DEMO_USER,
};

export const DEMO_PETS: Pet[] = [
  {
    id: 1, user_id: 1, name: 'Rex', species: 'dog', breed: 'Golden Retriever',
    date_of_birth: '2021-03-15', sex: 'male', weight_kg: 32,
    photo_url: null, notes: 'Loves to play fetch!',
    created_at: now, updated_at: now,
  },
  {
    id: 2, user_id: 1, name: 'Luna', species: 'cat', breed: 'Siamese',
    date_of_birth: '2022-08-10', sex: 'female', weight_kg: 4.2,
    photo_url: null, notes: 'Indoor cat, loves sunny spots',
    created_at: now, updated_at: now,
  },
];

export const DEMO_FEEDING: Record<number, FeedingLog[]> = {
  1: [
    { id: 1, pet_id: 1, datetime: now, food_type: 'Dry kibble', planned_amount_grams: 400, actual_amount_grams: 200, notes: 'Morning meal' },
    { id: 2, pet_id: 1, datetime: now, food_type: 'Dry kibble', planned_amount_grams: 400, actual_amount_grams: 180, notes: 'Evening meal' },
  ],
  2: [
    { id: 3, pet_id: 2, datetime: now, food_type: 'Wet food', planned_amount_grams: 150, actual_amount_grams: 140, notes: null },
  ],
};

export const DEMO_WATER: Record<number, WaterLog[]> = {
  1: [
    { id: 1, pet_id: 1, datetime: now, amount_ml: 350, daily_goal_ml: 800 },
    { id: 2, pet_id: 1, datetime: now, amount_ml: 200, daily_goal_ml: 800 },
  ],
  2: [
    { id: 3, pet_id: 2, datetime: now, amount_ml: 120, daily_goal_ml: 300 },
  ],
};

export const DEMO_VACCINES: Record<number, Vaccine[]> = {
  1: [
    { id: 1, pet_id: 1, name: 'Rabies / Raiva', date_administered: '2025-06-15', next_due_date: '2026-06-15', clinic: 'PetCare Clinic', notes: null, document_url: null },
    { id: 2, pet_id: 1, name: 'V10', date_administered: '2025-03-01', next_due_date: '2026-03-01', clinic: 'PetCare Clinic', notes: 'Annual booster', document_url: null },
  ],
  2: [
    { id: 3, pet_id: 2, name: 'FVRCP', date_administered: '2025-09-20', next_due_date: '2026-09-20', clinic: 'Cat House Vet', notes: null, document_url: null },
  ],
};

export const DEMO_MEDICATIONS: Record<number, Medication[]> = {
  1: [
    { id: 1, pet_id: 1, name: 'Heartworm Prevention', dosage: '1 tablet', frequency_per_day: 1, start_date: today, end_date: null, times_of_day: ['08:00'], notes: 'Monthly' },
  ],
  2: [],
};

export const DEMO_EVENTS: Record<number, PetEvent[]> = {
  1: [
    { id: 1, pet_id: 1, type: 'vet_visit', title: 'Annual Checkup / Consulta Anual', datetime_start: new Date(Date.now() + 7 * 86400000).toISOString(), duration_minutes: 30, location: 'PetCare Clinic', notes: null, reminder_minutes_before: 60 },
    { id: 2, pet_id: 1, type: 'grooming', title: 'Bath & Grooming / Banho e Tosa', datetime_start: new Date(Date.now() + 3 * 86400000).toISOString(), duration_minutes: 60, location: 'Happy Paws Grooming', notes: null, reminder_minutes_before: 120 },
  ],
  2: [
    { id: 3, pet_id: 2, type: 'vaccine', title: 'Booster Vaccine / Reforco', datetime_start: new Date(Date.now() + 14 * 86400000).toISOString(), duration_minutes: 15, location: 'Cat House Vet', notes: null, reminder_minutes_before: 60 },
  ],
};

export const DEMO_SYMPTOMS: Record<number, Symptom[]> = {
  1: [
    { id: 1, pet_id: 1, datetime: now, type: 'itching', severity: 'mild', notes: 'Scratching ears after walk' },
  ],
  2: [],
};

export function getDemoDashboard(petId: number): PetDashboard {
  const feeding = DEMO_FEEDING[petId] ?? [];
  const water = DEMO_WATER[petId] ?? [];
  const events = DEMO_EVENTS[petId] ?? [];
  const meds = DEMO_MEDICATIONS[petId] ?? [];

  return {
    feeding: {
      total_actual_grams: feeding.reduce((s, f) => s + f.actual_amount_grams, 0),
      total_planned_grams: feeding.reduce((s, f) => s + (f.planned_amount_grams ?? 0), 0),
      entries_count: feeding.length,
    },
    water: {
      total_ml: water.reduce((s, w) => s + w.amount_ml, 0),
      daily_goal_ml: water[0]?.daily_goal_ml ?? null,
      entries_count: water.length,
    },
    upcoming_events: events,
    active_medications: meds,
  };
}
