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
  onCreate: (src: string) => void
}

function LinkRowAdd(props: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [value, setValue] = useState<string>('https://www.youtube.com/watch?v=dQw4w9WgXcQ')

  useKey(
    'Enter',
    () => {
      const trimmedValue = value.trim()

      if (!isValidUrl(trimmedValue)) {
        toast.error('Link is invalid URL')

        return
      }

      props.onCreate(trimmedValue)
    },
    {},
    [value]
  )

  useClickAway(ref, () => {
    const trimmedValue = value.trim()

    if (!isValidUrl(trimmedValue)) {
      toast.error('Link is invalid URL')

      return
    }

    props.onCreate(trimmedValue)
    return
  })

  return (
    <div ref={ref} className="pl-4 rounded-lg -mx-1 flex items-center bg-white border border-solid border-gray-200">
      <Image
        className="mr-2"
        alt="test"
        width={17}
        height={17}
        src={`https://www.google.com/s2/favicons?domain=${value}&sz=256`}
      />

      <input
        onChange={(event) => setValue(event.target.value)}
        value={value}
        autoFocus
        type="text"
        placeholder="Edit man"
        className="w-full py-2 pr-4 focus:outline-none bg-transparent"
      />
    </div>
  )
}

export default LinkRowAdd
