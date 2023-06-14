'use client'
import React from 'react'
import { onAuthStateChanged, getAuth, User } from 'firebase/auth'
import firebase_app from '@/firebase/firebaseConfig'
import LoadingPage from '@/components/LoadingPage'

const auth = getAuth(firebase_app)

export interface AuthContextState {
  user: User | null
}

export const AuthContext = React.createContext<AuthContextState>({ user: null })

export const useAuthContext = () => React.useContext(AuthContext)

export interface AuthContextProps {
  children: React.ReactNode
}

export const AuthContextProvider = ({ children }: AuthContextProps) => {
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
      } else {
        setUser(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ user }}>{loading ? <LoadingPage /> : children}</AuthContext.Provider>
}
