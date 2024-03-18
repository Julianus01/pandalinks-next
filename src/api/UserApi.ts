import { SupabaseTable, supabaseClient } from '@/utils/supabase-utils'
import { Session } from '@supabase/supabase-js'

export interface Profile {
  id: string
  username: string
  full_name: string
  avatar_url: string
  website: string
  phone: string
  has_subscription: boolean
}

async function getProfile(session: Session) {

  if (!session?.user) {
    throw new Error('No user on the session!')
  }

  const { data, error, status } = await supabaseClient
    .from(SupabaseTable.Profiles)
    .select()
    .eq('id', session?.user.id)
    .single()

  if (error && status !== 406) {

    throw error
  }


  return data
}

async function updateProfile(updatedProfile: Partial<Profile>) {

  const { data, error } = await supabaseClient.from(SupabaseTable.Profiles).update(updatedProfile).eq('id', updatedProfile.id)

  if (error) {

    throw error
  }


  return data
}

export const UserApi = {
  getProfile,
  updateProfile,
}
