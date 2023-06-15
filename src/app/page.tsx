'use client'
import AuthLayout from '@/components/AuthLayout'
import { withAuth } from '@/firebase/withAuth'

function HomePage() {
  return (
    <AuthLayout>
      <div className="w-full max-w-3xl h-16 px-5 mx-auto pt-20">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              className="w-6 h-6 text-gray-400 absolute left-3 inset-y-0 my-auto"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>

            <input
              type="text"
              placeholder="Search your links..."
              className="w-full pl-12 pr-3 py-2 text-gray-700 bg-white outline-none border focus:border-gray-700 shadow-sm rounded-lg"
            />
          </div>

          <button className="px-3 flex gap-1 items-center py-1.5 bg-white text-sm text-gray-700 duration-100 border rounded-lg hover:bg-gray-50 active:bg-gray-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add link
          </button>
        </div>
      </div>
    </AuthLayout>
  )
}

export default withAuth(HomePage)
