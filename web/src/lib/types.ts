export interface User {
  id: number;
  name: string;
  email: string;
  timezone: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Pet {
  id: number;
  user_id: number;
  name: string;
  species: string;
  breed?: string;
  date_of_birth?: string;
  sex?: string;
  weight_kg?: number;
  photo_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PetCreate {
  name: string;
  species: string;
  breed?: string;
  date_of_birth?: string;
  sex?: string;
  weight_kg?: number;
  notes?: string;
}

export interface FeedingLog {
  id: number;
  pet_id: number;
  datetime: string;
  food_type: string;
  planned_amount_grams?: number;
  actual_amount_grams: number;
  notes?: string;
}

export interface FeedingCreate {
  food_type: string;
  actual_amount_grams: number;
  planned_amount_grams?: number;
  notes?: string;
}

export interface WaterLog {
  id: number;
  pet_id: number;
  datetime: string;
  amount_ml: number;
  daily_goal_ml?: number;
}

export interface WaterCreate {
  amount_ml: number;
  daily_goal_ml?: number;
}

export interface Vaccine {
  id: number;
  pet_id: number;
  name: string;
  date_administered: string;
  next_due_date?: string;
  clinic?: string;
  notes?: string;
  document_url?: string;
}

export interface VaccineCreate {
  name: string;
  date_administered: string;
  next_due_date?: string;
  clinic?: string;
  notes?: string;
}

export interface Medication {
  id: number;
  pet_id: number;
  name: string;
  dosage: string;
  frequency_per_day: number;
  start_date: string;
  end_date?: string;
  times_of_day?: string[];
  notes?: string;
}

export interface MedicationCreate {
  name: string;
  dosage: string;
  frequency_per_day: number;
  start_date: string;
  end_date?: string;
  times_of_day?: string[];
  notes?: string;
}

export interface PetEvent {
  id: number;
  pet_id: number;
  type: string;
  title: string;
  datetime_start: string;
  duration_minutes?: number;
  location?: string;
  notes?: string;
  reminder_minutes_before?: number;
}

export interface EventCreate {
  type: string;
  title: string;
  datetime_start: string;
  duration_minutes?: number;
  location?: string;
  notes?: string;
  reminder_minutes_before?: number;
}

export interface Symptom {
  id: number;
  pet_id: number;
  datetime: string;
  type: string;
  severity: string;
  notes?: string;
}

export interface SymptomCreate {
  type: string;
  severity: string;
  notes?: string;
}

export interface PetDashboard {
  feeding: {
    total_actual_grams: number;
    total_planned_grams: number;
    entries_count: number;
  };
  water: {
    total_ml: number;
    daily_goal_ml: number;
    entries_count: number;
  };
  upcoming_events: PetEvent[];
  active_medications: Medication[];
}
