/* eslint-disable react/display-name */
import { ComponentType, useContext, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthContext } from '@/context/AuthContext'
import LoadingPage from '@/components/shared/LoadingPage'

export const withAuth =
  <P extends {}>(Component: ComponentType<P>): ComponentType<P> =>
  (props) => {
    const { user, loading } = useContext(AuthContext)
    const router = useRouter()

    useEffect(() => {
      if (!loading && !user) {
        router.push('/login')
      }
    }, [loading, router, user])

    if (!user && loading) {
      return <LoadingPage />
    }

    return <Component {...props} />
  }
