import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate that variables are present and not the default placeholders
const isConfigured = 
  supabaseUrl && 
  supabaseUrl.length > 0 &&
  supabaseUrl !== 'YOUR_SUPABASE_URL_HERE' && 
  supabaseAnonKey && 
  supabaseAnonKey.length > 0 &&
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY_HERE'

if (!isConfigured) {
  console.warn('Supabase configuration is incomplete. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local')
}

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
