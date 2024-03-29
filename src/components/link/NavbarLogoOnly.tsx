import React from 'react'
import Image from 'next/image'

function NavbarLogoOnly() {
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl h-20 pt-6 flex items-center px-5">
        <Image className="dark:invert" priority src="/logo-side-text-md.svg" width={162.8} height={30} alt="logo" />
      </div>
    </div>
  )
}

export default NavbarLogoOnly
