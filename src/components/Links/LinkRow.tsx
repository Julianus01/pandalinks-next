import { Link } from '@/api/AdminLinksApi'
import { UpdateLinkRequestParams } from '@/api/LinksApi'
import { UrlUtils } from '@/utils/urlUtils'
import classNames from 'classnames'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { useClickAway, useKey } from 'react-use'
import { toast } from 'sonner'

interface Props {
  link: Link
  isSelected: boolean
  isEditMode: boolean
  onClick: () => void
  onDoubleClick: () => void
  onContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void
  onExitEditMode: () => void
  onUpdate: (updatedLink: UpdateLinkRequestParams) => void
}

function LinkRow(props: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [value, setValue] = useState<string>(props.link.src)

  useKey(
    'Escape',
    () => {
      if (props.isEditMode) {
        setValue(props.link.src)
      }
    },
    {},
    [props.isEditMode, props.link.src]
  )

  useKey(
    'Enter',
    () => {
      const trimmedValue = value.trim()

      if (!trimmedValue?.length) {
        setValue(props.link.src)
        props.onExitEditMode()

        return
      }

      if (props.isEditMode && trimmedValue !== props.link.src) {
        if (!UrlUtils.isValidUrl(trimmedValue)) {
          toast('Link is invalid URL')

          return
        }

        props.onUpdate({ id: props.link.id, src: trimmedValue })
        props.onExitEditMode()
      }
    },
    {},
    [props.isEditMode, value, props.link.src]
  )

  useClickAway(ref, () => {
    const trimmedValue = value.trim()

    if (props.isEditMode) {
      if (!trimmedValue?.length) {
        setValue(props.link.src)
        props.onExitEditMode()

        return
      }

      if (trimmedValue !== props.link.src) {
        if (!UrlUtils.isValidUrl(trimmedValue)) {
          setValue(props.link.src)
          toast('Link is invalid URL')
          props.onExitEditMode()

          return
        }

        props.onUpdate({ id: props.link.id, src: trimmedValue })
        props.onExitEditMode()
        return
      }

      props.onExitEditMode()
    }
  })

  return (
    <div
      ref={ref}
      onClick={props.onClick}
      onDoubleClick={props.onDoubleClick}
      onContextMenu={props.onContextMenu}
      className={classNames({
        'pl-4 hover:bg-gray-100 rounded-lg cursor-pointer -mx-1.5 flex items-center border border-solid group': true,
        'border-gray-50': !props.isSelected,
        'hover:border-gray-200 bg-gray-100 border border-solid border-gray-200': props.isSelected,
        'cursor-default': props.isEditMode,
        'bg-white hover:bg-white': props.isEditMode,
      })}
    >
      <div className="relative">
        <div className="absolute top-0 right-0 bottom-0 left-0 z-1">
          {UrlUtils.isValidUrl(value) && (
            <Image
              className={classNames({
                'bg-gray-50 group-hover:bg-gray-100': true,
                'bg-white group-hover:bg-white': props.isEditMode,
              })}
              alt="test"
              width={17}
              height={17}
              src={`https://www.google.com/s2/favicons?domain=${value}&sz=256`}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null // prevents looping
                currentTarget.style.display = 'none'
              }}
            />
          )}
        </div>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4 mr-2 text-rose-500"
        >
          <path
            fillRule="evenodd"
            d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {!props.isEditMode && <p className="py-2 pr-4">{value}</p>}

      {props.isEditMode && (
        <input
          onChange={(event) => setValue(event.target.value)}
          value={value}
          autoFocus
          type="text"
          placeholder="Nike.com"
          className="w-full py-2 pr-4 focus:outline-none bg-transparent"
        />
      )}
    </div>
  )
}

export default LinkRow
