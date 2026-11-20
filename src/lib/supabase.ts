// Optional Supabase configuration detector.
// When VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are provided in .env,
// the admin settings panel displays cloud-ready migration instructions using supabase/schema.sql.

export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  isConfigured: Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY),
};
