'use client'
import { loginWithGoogleCredential } from '@/firebase/auth'
import { useRouter } from 'next/navigation'
import React from 'react'

function LoginPage() {
  const router = useRouter()

  async function login() {
    await loginWithGoogleCredential()
    router.push('/')
  }

  return (
    <div className="flex justify-center mt-20">
      <button
        onClick={login}
        className="flex w-full max-w-sm justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Login
      </button>
    </div>
  )
}

export default LoginPage
