import { z } from 'zod'

const EnvSchema = z.object({
  PORT: z.string().optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional()
})

export const env = EnvSchema.parse(process.env)


