import { Link } from '@/api/AdminLinksApi'
import { UpdateLinkRequestParams } from '@/api/LinksApi'
import classNames from 'classnames'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { useClickAway, useKey } from 'react-use'
import { toast } from 'sonner'

function isValidUrl(urlString: string) {
  var urlPattern = new RegExp(
    '^(https?:\\/\\/)?' + // validate protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
      '(\\#[-a-z\\d_]*)?$',
    'i'
  ) // validate fragment locator

  return !!urlPattern.test(urlString)
}

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
    'Enter',
    () => {
      const trimmedValue = value.trim()

      if (props.isEditMode && trimmedValue !== props.link.src) {
        if (!isValidUrl(trimmedValue)) {
          toast.error('Link is invalid URL')

          return
        }

        props.onUpdate({ id: props.link.id, src: trimmedValue })
        props.onExitEditMode()
      }
    },
    {},
    [props.isEditMode, value]
  )

  useClickAway(ref, () => {
    const trimmedValue = value.trim()

    if (props.isEditMode) {
      if (trimmedValue !== props.link.src) {
        if (!isValidUrl(trimmedValue)) {
          setValue(props.link.src)
          props.onExitEditMode()
          toast.error('Link is invalid URL')

          return
        }

        props.onUpdate({ id: props.link.id, src: trimmedValue })
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
        'px-4 py-2 hover:bg-gray-100 rounded-lg cursor-pointer -mx-1 flex items-center border border-solid': true,
        'border-gray-50': !props.isSelected,
        'hover:border-gray-200 bg-gray-100 border border-solid border-gray-200': props.isSelected,
        'cursor-default': props.isEditMode,
        'bg-white hover:bg-white': props.isEditMode,
      })}
    >
      <Image
        className="mr-2"
        alt="test"
        width={17}
        height={17}
        src={`https://www.google.com/s2/favicons?domain=${value}&sz=256`}
      />

      {!props.isEditMode && <p>{value}</p>}

      {props.isEditMode && (
        <input
          onChange={(event) => setValue(event.target.value)}
          value={value}
          autoFocus
          type="text"
          placeholder="Edit man"
          className="w-full focus:outline-none bg-transparent"
        />
      )}
    </div>
  )
}

export default LinkRow
