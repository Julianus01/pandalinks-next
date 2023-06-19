import { UrlUtils } from '@/utils/urlUtils'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { useClickAway, useKey } from 'react-use'
import { toast } from 'sonner'

interface Props {
  onCreate: (url: string) => void
  onClose: () => void
}

function LinkRowAdd(props: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [value, setValue] = useState<string>('')

  useKey(
    'Enter',
    () => {
      const trimmedValue = value.trim()

      if (!trimmedValue?.length) {
        props.onClose()

        return
      }

      if (!UrlUtils.isValidUrl(trimmedValue)) {
        toast('Invalid Link')

        return
      }

      props.onCreate(trimmedValue)
    },
    {},
    [value]
  )

  useClickAway(ref, () => {
    const trimmedValue = value.trim()

    if (!trimmedValue?.length) {
      props.onClose()

      return
    }

    if (!UrlUtils.isValidUrl(trimmedValue)) {
      toast('Invalid Link')
      props.onClose()

      return
    }

    props.onCreate(trimmedValue)
  })

  return (
    <div
      ref={ref}
      className="pl-4 rounded-lg -mx-1.5 flex items-center bg-white border border-solid border-gray-200 shadow-sm"
    >
      <div className="relative">
        <div className="absolute top-0 right-0 bottom-0 left-0 z-1">
          <Image
            className="bg-white group-hover:bg-white"
            alt="test"
            width={17}
            height={17}
            src={`https://www.google.com/s2/favicons?domain=${value}&sz=256`}
            onError={({ currentTarget }) => {
              currentTarget.onerror = null // prevents looping
              currentTarget.style.display = 'none'
            }}
          />
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

      <input
        onChange={(event) => setValue(event.target.value)}
        value={value}
        autoFocus
        type="text"
        placeholder="Nike.com"
        className="w-full py-2 pr-4 focus:outline-none bg-transparent"
      />
    </div>
  )
}

export default LinkRowAdd
