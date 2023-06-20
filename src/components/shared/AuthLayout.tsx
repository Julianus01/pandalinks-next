import React from 'react'
import Navbar from './Navbar'

interface Props {
  header?: React.ReactNode
  children: React.ReactNode
}

function AuthLayout(props: Props) {
  return (
    <>
      {!props.header && <Navbar />}

      {props.header && props.header}

      {props.children}
    </>
  )
}

export default AuthLayout
