import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html className='dark' lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <body className="bg-gray-50 dark:bg-slate-900 dark:bg-gradient-to-r dark:from-slate-900 dark:to-slate-800">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
