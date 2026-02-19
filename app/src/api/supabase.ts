import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// OAuth redirect URL -- set via env var for each deployment target
export const OAUTH_REDIRECT_URL =
  process.env.EXPO_PUBLIC_OAUTH_REDIRECT_URL || 'https://pinkoffense.github.io/PWellTrack';

/** True when Supabase credentials are properly configured */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// SEC-04: Only create the Supabase client when both URL and key are present.
// When not configured, we export a dummy client that will never be used
// because isSupabaseConfigured guards all Supabase operations.
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : (null as unknown as SupabaseClient);
