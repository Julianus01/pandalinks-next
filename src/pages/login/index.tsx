import LoadingPage from '@/components/shared/LoadingPage'
import { SupabaseAuthContext } from '@/context/SupabaseAuthContext'
import { supabaseClient } from '@/utils/supabase-utils'
import { useRouter } from 'next/navigation'
import React, { useContext } from 'react'

const features = [
  {
    name: 'Bookmarks',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path
          fillRule="evenodd"
          d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    name: 'Categorize',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path
          fillRule="evenodd"
          d="M11.097 1.515a.75.75 0 01.589.882L10.666 7.5h4.47l1.079-5.397a.75.75 0 111.47.294L16.665 7.5h3.585a.75.75 0 010 1.5h-3.885l-1.2 6h3.585a.75.75 0 010 1.5h-3.885l-1.08 5.397a.75.75 0 11-1.47-.294l1.02-5.103h-4.47l-1.08 5.397a.75.75 0 01-1.47-.294l1.02-5.103H3.75a.75.75 0 110-1.5h3.885l1.2-6H5.25a.75.75 0 010-1.5h3.885l1.08-5.397a.75.75 0 01.882-.588zM10.365 9l-1.2 6h4.47l1.2-6h-4.47z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
]

function LoginPage() {
  const router = useRouter()
  const authData = useContext(SupabaseAuthContext)

  async function login() {
    await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.href },
    })
  }

  if (authData.loading) {
    return <LoadingPage />
  }

  if (authData.user) {
    router.push('/')
    return <LoadingPage />
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-28 gap-12 text-gray-600 dark:text-slate-400 md:px-8 xl:flex">
      <div className="space-y-5 max-w-2xl mx-auto text-center">
        <div className="flex flex-wrap items-center justify-center gap-6">
          {features.map((item, idx) => (
            <div key={idx} className="flex items-center gap-x-2 text-gray-500 dark:text-slate-400 text-sm">
              {item.icon}
              {item.name}
            </div>
          ))}
        </div>

        <h1 className="text-3xl sm:text-4xl text-gray-800 dark:text-white font-extrabold mx-auto md:text-5xl ">
          Make your bookmarks life easier with{' '}
          <span className="bg-gradient-to-r from-gray-800 dark:from-slate-200 dark:via-slate-400 dark:to-slate-600 via-red-400 to-rose-400 bg-clip-text text-transparent">
            Pandalinks
          </span>
        </h1>

        <p className="max-w-xl mx-auto">
          Create, update and manage your links in style with a minimalist user interface and smooth experience
        </p>

        <div className="items-center justify-center gap-x-3 space-y-3 flex sm:space-y-0">
          <button
            onClick={login}
            className="flex items-center justify-center gap-x-2 py-2 px-4 text-white font-medium bg-gray-800 hover:bg-gray-700 active:bg-gray-900 rounded-lg md:inline-flex"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_17_40)">
                <path
                  d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z"
                  fill="#fff"
                />
                <path
                  d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z"
                  fill="#fff"
                />
                <path
                  d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z"
                  fill="#fff"
                />
                <path
                  d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z"
                  fill="#fff"
                />
              </g>
              <defs>
                <clipPath id="clip0_17_40">
                  <rect width="48" height="48" fill="white" />
                </clipPath>
              </defs>
            </svg>
            Continue with Google
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path
                fillRule="evenodd"
                d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
