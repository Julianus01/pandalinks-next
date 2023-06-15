import React from 'react'
import Navbar from './Navbar'

interface Props {
  children: React.ReactNode
}

function AuthLayout(props: Props) {
  return (
    <>
      <Navbar />
      {props.children}
    </>
  )
}

export default AuthLayout
