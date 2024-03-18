import { supabaseClient } from "@/utils/supabase-utils"

export async function getCurrentUser() {
  const { data: { user } } = await supabaseClient.auth.getUser()
  return user
}