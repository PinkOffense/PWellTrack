import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://bbrlzpxctxwqclwudnuj.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// OAuth redirect URL — set via env var for each deployment target
export const OAUTH_REDIRECT_URL =
  process.env.EXPO_PUBLIC_OAUTH_REDIRECT_URL || 'https://pinkoffense.github.io/PWellTrack';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
