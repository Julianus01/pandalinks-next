import React, { useEffect, useState } from 'react'
import { onAuthStateChanged, getAuth, User } from 'firebase/auth'
import firebase_app from '@/firebase/firebaseConfig'
import LoadingPage from '@/components/shared/LoadingPage'
import { useRouter } from 'next/router'
import nookies from 'nookies'

const auth = getAuth(firebase_app)

export interface AuthContextState {
  user: User | null
  loading: boolean
}

export const AuthContext = React.createContext<AuthContextState>({ user: null, loading: true })

export interface AuthContextProps {
  children: React.ReactNode
}

export const AuthContextProvider = ({ children }: AuthContextProps) => {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken()
        setUser(user)
        nookies.set(undefined, 'token', token, { path: '/' })
      } else {
        setUser(null)
        nookies.set(undefined, 'token', '', { path: '/' })
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // force refresh the token every 10 minutes
  useEffect(() => {
    const handle = setInterval(async () => {
      const user = auth.currentUser
      if (user) await user.getIdToken(true)
    }, 10 * 60 * 1000)

    // clean up setInterval
    return () => clearInterval(handle)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {loading && !router.asPath.includes('/login') && <LoadingPage />}

      {!loading && children}
    </AuthContext.Provider>
  )
}
