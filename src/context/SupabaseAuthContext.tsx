import React, { useEffect, useState } from 'react'
import LoadingPage from '@/components/shared/LoadingPage'
import { useRouter } from 'next/router'
import { Session, User } from '@supabase/supabase-js'
import { supabaseClient } from '@/utils/supabase-utils'

export interface SupabaseAuthContextState {
  user: User | undefined
  loading: boolean
  authenticated: boolean
}

export const SupabaseAuthContext = React.createContext<SupabaseAuthContextState>({
  user: undefined,
  loading: true,
  authenticated: false,
})

export interface AuthContextProps {
  children: React.ReactNode
}

export const SupabaseAuthContextProvider = ({ children }: AuthContextProps) => {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)

  // TODO: Remove this?
  // const profileQuery = useQuery({
  //   queryKey: [ReactQueryKey.getProfile, session?.user?.id],
  //   queryFn: () => UserApi.getProfile(session as Session),
  //   enabled: !!session?.user?.id,
  // })

  useEffect(() => {
    supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        setSession(null)
        setIsLoadingSession(false)

        return
      }

      const expiresAtMilliseconds = (session.expires_at as number) * 1000
      if (expiresAtMilliseconds < Date.now()) {
        supabaseClient.auth.refreshSession()
        return
      }

      setSession(session)
      setIsLoadingSession(false)
    })
  }, [])

  return (
    <SupabaseAuthContext.Provider
      value={{
        user: session?.user,
        loading: isLoadingSession,
        authenticated: !!session,
      }}
    >
      {isLoadingSession && !router.asPath.includes('/login') && <LoadingPage />}

      {!isLoadingSession && children}
    </SupabaseAuthContext.Provider>
  )
}
