import { createClient } from '@supabase/supabase-js'

// UI
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
)

export enum SupabaseTable {
  // Value should be lowercase !
  Profiles = 'profiles',
  Links = 'links',
}
