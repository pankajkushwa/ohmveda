import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL_DEFAULT = 'https://mjqldmxrnratlkwicinw.supabase.co';
const SUPABASE_ANON_KEY_DEFAULT = 'sbp_498dcfd5aed1dbb8ce4b8150c7e0c1a68ec02473';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_URL_DEFAULT;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY_DEFAULT;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

