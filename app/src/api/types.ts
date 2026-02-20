// ---- User / Auth ----
export interface User {
  id: number;
  name: string;
  email: string;
  timezone: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

// ---- Pet ----
export interface Pet {
  id: number;
  user_id: number;
  name: string;
  species: string;
  breed: string | null;
  date_of_birth: string | null;
  sex: string | null;
  weight_kg: number | null;
  photo_url: string | null;
  notes: string | null;
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
  photo_url?: string;
  notes?: string;
}

// ---- Feeding ----
export interface FeedingLog {
  id: number;
  pet_id: number;
  datetime: string;
  food_type: string;
  planned_amount_grams: number | null;
  actual_amount_grams: number;
  notes: string | null;
}

export interface FeedingCreate {
  datetime?: string;
  food_type: string;
  planned_amount_grams?: number;
  actual_amount_grams: number;
  notes?: string;
}

// ---- Water ----
export interface WaterLog {
  id: number;
  pet_id: number;
  datetime: string;
  amount_ml: number;
  daily_goal_ml: number | null;
}

export interface WaterCreate {
  datetime?: string;
  amount_ml: number;
  daily_goal_ml?: number;
}

// ---- Vaccine ----
export interface Vaccine {
  id: number;
  pet_id: number;
  name: string;
  date_administered: string;
  next_due_date: string | null;
  clinic: string | null;
  notes: string | null;
  document_url: string | null;
}

export interface VaccineCreate {
  name: string;
  date_administered: string;
  next_due_date?: string;
  clinic?: string;
  notes?: string;
  document_url?: string;
}

// ---- Medication ----
export interface Medication {
  id: number;
  pet_id: number;
  name: string;
  dosage: string;
  frequency_per_day: number;
  start_date: string;
  end_date: string | null;
  times_of_day: string[] | null;
  notes: string | null;
}

export interface MedicationCreate {
  name: string;
  dosage: string;
  frequency_per_day: number;
  start_date: string;
  times_of_day?: string[];
  end_date?: string;
  notes?: string;
}

// ---- Event ----
export interface PetEvent {
  id: number;
  pet_id: number;
  type: string;
  title: string;
  datetime_start: string;
  duration_minutes: number | null;
  location: string | null;
  notes: string | null;
  reminder_minutes_before: number | null;
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

// ---- Symptom ----
export interface Symptom {
  id: number;
  pet_id: number;
  datetime: string;
  type: string;
  severity: string;
  notes: string | null;
}

export interface SymptomCreate {
  datetime?: string;
  type: string;
  severity: string;
  notes?: string;
}

// ---- Dashboard ----
export interface FeedingSummary {
  total_actual_grams: number;
  total_planned_grams: number | null;
  entries_count: number;
}

export interface WaterSummary {
  total_ml: number;
  daily_goal_ml: number | null;
  entries_count: number;
}

export interface PetDashboard {
  feeding: FeedingSummary;
  water: WaterSummary;
  upcoming_events: PetEvent[];
  active_medications: Medication[];
}

export interface VaccineStatusSummary {
  status: 'up_to_date' | 'due_soon' | 'overdue' | 'no_records';
  overdue_count: number;
}

export interface PetSummaryItem {
  pet: Pet;
  dashboard: PetDashboard;
  vaccine_status: VaccineStatusSummary;
}
