import { createClient } from "@supabase/supabase-js";

// Reads public client configuration from the Vite environment at build time.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// RLS protects database access; never put the Supabase service-role key here.
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
