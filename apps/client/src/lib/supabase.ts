import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
export const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnon)

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnon as string, {
      auth: { persistSession: true, autoRefreshToken: true }
    })
  : null


