import { createClient } from '@supabase/supabase-js'
import { env } from './env'

if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE) {
  // Lazy fail; routes will surface clearer errors
  // Intentionally no throw to allow health endpoint without Supabase
}

export const supabase = env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE
  ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE, {
      auth: { persistSession: false }
    })
  : null


