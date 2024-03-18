import { UseLinksSelection, useLinksSelection } from '@/hooks/useLinksSelection'
import { useRef, useState } from 'react'
import { useClickAway, useKey } from 'react-use'
import { Popover } from '@headlessui/react'

interface Props {
  value: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onCreate: (url: string, title: string) => void
  isLoading: boolean
  linksSelection: UseLinksSelection
}

function SearchAndCreateLinksInput(props: Props) {
  const ref = useRef<HTMLInputElement>(null)
  const popoverPanelRef = useRef<HTMLDivElement>(null)
  const popoverButtonRef = useRef<HTMLButtonElement>(null)
  const linksSelection = useLinksSelection()

  const [title, setTitle] = useState<string>('')
  const [url, setUrl] = useState<string>('')

  useClickAway(popoverPanelRef, resetState)

  useKey('Escape', () => {
    ref.current?.blur()
  })

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

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' && url.length && title.length) {
      onCreate()
    }
  }

  function resetState() {
    setTimeout(() => {
      setUrl('')
      setTitle('')
    }, 100)
  }

  function onCreate() {
    popoverButtonRef.current?.click()
    props.onCreate(url, title)
    resetState()
  }

  function onTogglePopover(isOpen: boolean) {
    return () => {
      if (!isOpen) {
        props.linksSelection.setSelectionParams({ selectedId: null, editLinkId: null })
      }
    }
  }

  return (
    <div className="flex-1 flex space-x-2">
      <div className="relative flex-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6 text-gray-400 absolute left-3 inset-y-0 my-auto dark:text-slate-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>

        <input
          ref={ref}
          value={props.value}
          onChange={props.onChange}
          type="text"
          onFocus={(e) => e.target.select()}
          placeholder="Search your links..."
          className="w-full pl-12 pr-20 py-2 text-gray-700 bg-white outline-none border focus:ring-offset-0 focus:ring-2 focus:ring-slate-200 focus:border-slate-300 shadow-sm rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-slate-700"
        />

        <div className="absolute flex items-center space-x-1 right-3 inset-y-0 my-auto select-none">
          <kbd className="px-2 py-1 text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600">
            ⌘
          </kbd>

          <kbd className="px-2 py-1 text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600">
            F
          </kbd>
        </div>
      </div>

      <Popover className="relative">
        {({ open }) => (
          <>
            <Popover.Button
              onClick={onTogglePopover(open)}
              ref={popoverButtonRef}
              disabled={props.isLoading}
              className="btn-default h-full px-3 outline-none"
            >
              {!props.isLoading && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-800 dark:text-gray-300"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              )}

              {props.isLoading && (
                <svg
                  className="animate-spin text-gray-500 dark:text-slate-300"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="2" x2="12" y2="6"></line>
                  <line x1="12" y1="18" x2="12" y2="22"></line>
                  <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                  <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                  <line x1="2" y1="12" x2="6" y2="12"></line>
                  <line x1="18" y1="12" x2="22" y2="12"></line>
                  <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                  <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                </svg>
              )}
            </Popover.Button>

            <Popover.Panel
              ref={popoverPanelRef}
              className="absolute z-20 space-y-2 -right-8 mt-2 w-[340px] rounded-lg bg-white shadow-md border text-sm text-gray-800 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 p-4"
            >
              <input
                onKeyDown={onKeyDown}
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                type="text"
                autoFocus
                placeholder="URL: instagram.com"
                className="w-full px-2 py-2 text-gray-700 bg-gray-50 outline-none border focus:ring-offset-0 focus:ring-1 focus:ring-slate-200 focus:border-slate-300 shadow-sm rounded-lg dark:bg-gray-800 dark:border-slate-700 dark:text-white dark:focus:ring-slate-700"
              />

              <input
                onKeyDown={onKeyDown}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                type="text"
                placeholder="Title: Coolest page"
                className="w-full px-2 py-2 text-gray-700 bg-gray-50 outline-none border focus:ring-offset-0 focus:ring-1 focus:ring-slate-200 focus:border-slate-300 shadow-sm rounded-lg dark:bg-gray-800 dark:border-slate-700 dark:text-white dark:focus:ring-slate-700"
              />

              <button
                onClick={onCreate}
                disabled={!title.length || !url.length}
                className="btn-default dark:bg-slate-700 dark:border-slate-700 dark:hover:bg-slate-600 dark:hover:border-slate-600 ml-auto"
              >
                Create link
              </button>
            </Popover.Panel>
          </>
        )}
      </Popover>
    </div>
  )
}

export default SearchAndCreateLinksInput
