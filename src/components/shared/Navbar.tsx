import React from 'react'
import Image from 'next/image'
import { logout } from '@/firebase/auth'

function Navbar() {
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl h-20 pt-6 flex items-center px-5">
        <Image priority src="/logo-side-text-md.svg" width={162.8} height={30} alt="logo" />

        <button
          onClick={logout}
          className="block bg-white ml-auto px-4 py-2 mt-3 text-center text-gray-700 duration-150 font-medium rounded-lg border hover:bg-gray-50 active:bg-gray-100 sm:mt-0 md:text-sm"
        >
          logout
        </button>
      </div>
    </div>
  )
}

export default Navbar
