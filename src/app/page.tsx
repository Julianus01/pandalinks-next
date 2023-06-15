'use client'
import AuthLayout from '@/components/AuthLayout'
import { logout } from '@/firebase/auth'
import { withAuth } from '@/firebase/withAuth'

function HomePage() {
  return (
    <AuthLayout>
      <div className="flex flex-col items-center mt-20">
        <p className="mb-10">Bookmarks page</p>

        <button
          onClick={logout}
          className="block px-4 py-2 mt-3 text-center text-gray-700 duration-150 font-medium rounded-lg border hover:bg-gray-50 active:bg-gray-100 sm:mt-0 md:text-sm"
        >
          logout
        </button>
      </div>
    </AuthLayout>
  )
}

export default withAuth(HomePage)
