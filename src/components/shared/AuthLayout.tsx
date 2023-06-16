import React from 'react'
import Navbar from './Navbar'

interface Props {
  header?: React.ReactNode
  children: React.ReactNode
}

function AuthLayout(props: Props) {
  return (
    <>
      {!props.header && (
        <div className="fixed left-0 top-0 right-0 backdrop-blur-sm z-10">
          <Navbar />
        </div>
      )}

      {props.header && props.header}

      {props.children}
    </>
  )
}

export default AuthLayout
