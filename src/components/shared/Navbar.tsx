import React, { ChangeEvent, useContext } from 'react'
import Image from 'next/image'
// @ts-ignore
import { useTheme } from 'next-themes'
import { SupabaseAuthContext } from '@/context/SupabaseAuthContext'
import { supabaseClient } from '@/utils/supabase-utils'
import ImportBookmarksButton from '../link/ImportBookmarksButton'

function Navbar() {
  const { user } = useContext(SupabaseAuthContext)
  const { theme, setTheme } = useTheme()

  function logout() {
    supabaseClient.auth.signOut()
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl h-20 pt-6 flex items-center px-5">
        <Image
          className="dark:invert"
          priority
          src="/logo-side-text-md.svg"
          width={162.8}
          height={30}
          alt="logo"
        />

        <div className="flex items-center space-x-2 ml-auto">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="btn-default px-2.5"
          >
            {theme === 'light' ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            )}
          </button>

          <div className='hidden sm:flex'>
            <ImportBookmarksButton />
          </div>

          <button onClick={logout} className="btn-default">
            logout
          </button>

          {user?.user_metadata?.avatar_url && (
            <div className="relative inline-block">
              <Image
                width={38}
                height={38}
                className="inline-block rounded-full ring-2 ring-white dark:ring-gray-800"
                src={user?.user_metadata?.avatar_url}
                alt="avatar"
              />

              <span
                className="absolute bottom-0 right-0 inline-block w-3 h-3 bg-green-600 border-2 border-white
                  dark:border-slate-900 rounded-full"
              ></span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Navbar
