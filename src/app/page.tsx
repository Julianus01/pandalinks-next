'use client'
import { logout } from '@/firebase/auth'
import { withAuth } from '@/firebase/withAuth'

function HomePage() {
  return (
    <div className="flex flex-col items-center mt-20">
      <p className="mb-10">Bookmarks page</p>

      <button
        onClick={logout}
        className="px-10 flex items-center justify-center gap-x-3 py-2.5 mt-5 border rounded-lg text-sm font-medium hover:bg-gray-50 duration-150 active:bg-gray-100"
      >
        logout
      </button>
    </div>
  )
}

export default withAuth(HomePage)
