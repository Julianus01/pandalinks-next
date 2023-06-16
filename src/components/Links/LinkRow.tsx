import { Link } from '@/api/AdminLinksApi'
import { UpdateLinkRequestParams } from '@/api/LinksApi'
import { useTemporaryTrue } from '@/hooks/useTemporaryTrue'
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
  const [showCopied, showCopiedMessage] = useTemporaryTrue(1300)

  // CMD + C
  useKey(
    (event) => {
      return (event.ctrlKey || event.metaKey) && event.key === 'c'
    },
    () => {
      if (props.isSelected) {
        navigator.clipboard.writeText(value)
        showCopiedMessage()
      }
    }
  )

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
          toast('Invalid Link')

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
          toast('Invalid Link')
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
        'px-4 hover:bg-gray-100 rounded-lg cursor-pointer -mx-1.5 flex items-center border border-solid group': true,
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

      {!showCopied && !props.isEditMode && (
        <p className="py-2">
          {value}
          {/* {showCopied && <> - Copied</>} */}
        </p>
      )}

      {showCopied && <div className="py-2 font-semibold">Copied</div>}

      {props.isEditMode && (
        <input
          onChange={(event) => setValue(event.target.value)}
          value={value}
          autoFocus
          onFocus={(e) => e.target.select()}
          type="text"
          placeholder="Nike.com"
          className="flex-1 py-2 focus:outline-none bg-transparent"
        />
      )}

      {props.isSelected && !props.isEditMode && (
        <p className="inline ml-auto text-xs">
          <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
            Enter
          </kbd>{' '}
          to rename
        </p>
      )}
    </div>
  )
}

export default LinkRow
