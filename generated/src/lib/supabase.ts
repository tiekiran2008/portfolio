import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder'));

if (!supabaseConfigured) {
  console.info('[Supabase] Running in offline mode — Supabase URL and Key not set. Admin saves require Supabase configuration.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  { auth: { detectSessionInUrl: false, persistSession: true, autoRefreshToken: true } }
);

