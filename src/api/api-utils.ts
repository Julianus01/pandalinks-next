import { supabaseClient } from "@/utils/supabase-utils"

export async function getCurrentUser() {
  const { data: { user } } = await supabaseClient.auth.getUser()
  return user
}

export function wait(time = 1000) {
  return new Promise(resolve => setTimeout(resolve, time))
}