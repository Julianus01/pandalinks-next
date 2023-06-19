import React, { useContext } from 'react'
import Image from 'next/image'
import { logout } from '@/firebase/auth'
import { AuthContext } from '@/context/AuthContext'

function Navbar() {
  const { user } = useContext(AuthContext)

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl h-20 pt-6 flex items-center px-5">
        <Image priority src="/logo-side-text-md.svg" width={162.8} height={30} alt="logo" />

        <div className="flex items-center space-x-2 ml-auto">
          <button
            onClick={logout}
            className="block bg-white px-4 py-2 mt-3 text-center text-gray-700 duration-150 font-medium rounded-lg border hover:bg-gray-50 active:bg-gray-100 sm:mt-0 md:text-sm"
          >
            logout
          </button>

          {user?.photoURL && (
            <div className="relative inline-block">
              <Image
                width={38}
                height={38}
                className="inline-block rounded-full ring-2 ring-white"
                src={`${user.photoURL}`}
                alt="avatar"
              />

              <span className="absolute bottom-0 right-0 inline-block w-3 h-3 bg-green-600 border-2 border-white rounded-full"></span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Navbar
