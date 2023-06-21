import { AuthContextProvider } from '@/context/AuthContext'
import '../globals.css'
import { Inter } from 'next/font/google'
import { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

const inter = Inter({ display: 'swap', subsets: ['latin'] })

const queryClient = new QueryClient()

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <main className={inter.className}>
      <Toaster position="bottom-center" />

      <QueryClientProvider client={queryClient}>
        <AuthContextProvider>
          <Component {...pageProps} />
        </AuthContextProvider>
      </QueryClientProvider>
    </main>
  )
}

export default MyApp
