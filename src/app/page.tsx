'use client'
import { logout } from '@/firebase/auth'
import { withAuth } from '@/firebase/withAuth'

function HomePage() {
  return (
    <div className="flex flex-col items-center mt-20">
      <p className="mb-10">Bookmarks page</p>

      <button
        onClick={logout}
        className="flex w-full max-w-sm justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Logout
      </button>
    </div>
  )
}

export default withAuth(HomePage)
