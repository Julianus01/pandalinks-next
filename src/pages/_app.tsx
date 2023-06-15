import { AuthContextProvider } from '@/context/AuthContext'
import '../components/globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ display: 'swap', subsets: ['latin'] })

function MyApp({ Component, pageProps }) {
  return (
    <main className={inter.className}>
      <AuthContextProvider>
        <Component {...pageProps} />
      </AuthContextProvider>
    </main>
  )
}

export default MyApp
