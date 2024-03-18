import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <body className="bg-gray-50 dark:bg-gradient-to-tr dark:from-slate-900 dark:via-slate-900 via-70% dark:to-slate-800  min-h-screen">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
