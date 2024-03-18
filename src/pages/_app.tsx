import '../globals.css'
import { Inter } from 'next/font/google'
import { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { ThemeProvider, useTheme } from 'next-themes'
import { SupabaseAuthContextProvider } from '@/context/SupabaseAuthContext'

const inter = Inter({ display: 'swap', subsets: ['latin'] })

const queryClient = new QueryClient()

function MyApp({ Component, pageProps }: AppProps) {
  const { theme } = useTheme()

  return (
    <main className={inter.className}>
      <Toaster theme={(theme as 'light' | 'dark') || 'dark'} position="bottom-center" />

      <ThemeProvider defaultTheme="dark" attribute="class">
        <QueryClientProvider client={queryClient}>
          <SupabaseAuthContextProvider>
            <Component {...pageProps} />
          </SupabaseAuthContextProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </main>
  )
}

export default MyApp
