/* eslint-disable react/display-name */
import { ComponentType, useContext, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoadingPage from '@/components/shared/LoadingPage'
import { SupabaseAuthContext } from '@/context/SupabaseAuthContext'

export const withAuth =
  <P extends {}>(Component: ComponentType<P>): ComponentType<P> =>
  (props) => {
    const { authenticated, loading } = useContext(SupabaseAuthContext)
    const router = useRouter()

    useEffect(() => {
      if (!loading && !authenticated) {
        router.push('/login')
      }
    }, [authenticated, loading, router])

    if (!authenticated && loading) {
      return <LoadingPage />
    }

    return <Component {...props} />
  }
