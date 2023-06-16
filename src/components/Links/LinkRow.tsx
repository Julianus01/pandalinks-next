import { Link } from '@/api/AdminLinksApi'
import classNames from 'classnames'
import Image from 'next/image'
import { MouseEventHandler, RefObject, useEffect, useRef, useState } from 'react'

interface Props {
  ref: RefObject<HTMLDivElement>
  link: Link
  isSelected: boolean
  onClick: () => void
  onDoubleClick: () => void
  onContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void
}

function LinkRow(props: Props) {
  return (
    <div
      ref={props.ref}
      onClick={props.onClick}
      onDoubleClick={props.onDoubleClick}
      onContextMenu={props.onContextMenu}
      className={classNames({
        'px-4 py-2 hover:bg-gray-100 rounded-lg cursor-pointer -mx-1 flex items-center border border-solid': true,
        'border-gray-50': !props.isSelected,
        'hover:border-gray-200 bg-gray-100 border border-solid border-gray-200': props.isSelected,
      })}
    >
      <Image
        className="mr-2"
        alt="test"
        width={18}
        height={18}
        src={`https://www.google.com/s2/favicons?domain=${props.link.src}&sz=256`}
      />

      <p>{props.link.src}</p>
    </div>
  )
}

export default LinkRow
