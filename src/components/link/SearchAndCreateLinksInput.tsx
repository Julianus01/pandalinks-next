import { useLinksSelection } from '@/hooks/useLinksSelection'
import { UrlUtils } from '@/utils/url-utils'
import { useRef } from 'react'
import { useKey } from 'react-use'
import { toast } from 'sonner'

interface Props {
  value: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onCreate: (url: string) => void
  isCreateMode: boolean
}

function SearchAndCreateLinksInput(props: Props) {
  const ref = useRef<HTMLInputElement>(null)
  const linksSelection = useLinksSelection()

  useKey(
    'Enter',
    () => {
      if (ref.current === document.activeElement) {
        const trimmedValue = props.value.trim()

        if (!trimmedValue) {
          return
        }

        if (!UrlUtils.isValidUrl(trimmedValue)) {
          toast('Invalid Link')

          return
        }

        props.onCreate(trimmedValue)
      }
    },
    {},
    [props.value]
  )

  useKey(
    (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault()

        return true
      }

      return false
    },
    () => {
      linksSelection.setSelectionParams({ selectedId: null, editLinkId: null })

      ref.current?.focus()
    }
  )

  useKey('Escape', () => {
    ref.current?.blur()
  })

  return (
    <div className="relative flex-1">
      {props.isCreateMode && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6 text-gray-400 absolute left-3 inset-y-0 my-auto"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      )}

      {!props.isCreateMode && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6 text-gray-400 absolute left-3 inset-y-0 my-auto"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      )}

      <input
        ref={ref}
        value={props.value}
        onChange={props.onChange}
        type="text"
        placeholder={props.isCreateMode ? 'Instagram.com...' : 'Search your links...'}
        className="w-full pl-12 pr-3 py-2 text-gray-700 bg-white outline-none border focus:ring-offset-0 focus:ring-2 focus:ring-slate-200 focus:border-slate-300 shadow-sm rounded-lg"
      />

      <div className="absolute flex items-center space-x-1 right-3 inset-y-0 my-auto">
        <kbd className="px-2 py-1 text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-lg">⌘</kbd>

        <kbd className="px-2 py-1 text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-lg">F</kbd>
      </div>
    </div>
  )
}

export default SearchAndCreateLinksInput
