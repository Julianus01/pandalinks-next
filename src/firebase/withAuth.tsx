import { useContext, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthContext } from '@/context/AuthContext'
import LoadingPage from '@/components/LoadingPage'

// eslint-disable-next-line react/display-name
export const withAuth = (Component: React.FC) => (props: any) => {
  const { user } = useContext(AuthContext)
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [router, user])

  if (!user) {
    return <LoadingPage />
  }

  return <Component {...props} />
}
