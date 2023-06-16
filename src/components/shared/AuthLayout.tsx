import React from 'react'
import Navbar from './Navbar'

interface Props {
  children: React.ReactNode
}

function AuthLayout(props: Props) {
  return (
    <>
      <div className='fixed left-0 top-0 right-0 bg-gray-50 z-10'>
        <Navbar />
      </div>

      {props.children}
    </>
  )
}

export default AuthLayout
