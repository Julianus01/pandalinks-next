import { Link } from '@/api/LinksApi'
import { useKey } from 'react-use'

export enum ContextMenuAction {
  visit = 'visit',
  pin = 'pin',
  unpin = 'unpin',
  copyLink = 'copyLink',
  edit = 'edit',
  delete = 'delete',
}

interface Props {
  link: Link
  onClick: (action: ContextMenuAction) => void
}

function LinkContextMenuContent(props: Props) {
  const isPinned = props.link.tags.includes('pinned')

  useKey(
    (event) => {
      event.preventDefault()

      return event.key === 'c'
    },
    () => {
      props.onClick(ContextMenuAction.copyLink)
    }
  )

  useKey(
    (event) => {
      event.preventDefault()

      return event.key === 'e'
    },
    () => {
      props.onClick(ContextMenuAction.edit)
    }
  )

  useKey(
    (event) => {
      event.preventDefault()

      return event.key === 'Enter' || event.key === 'o'
    },
    () => {
      props.onClick(ContextMenuAction.visit)
    }
  )

  useKey(
    (event) => {
      event.preventDefault()

      return event.key === 'p'
    },
    () => {
      if (isPinned) {
        props.onClick(ContextMenuAction.unpin)
      } else {
        props.onClick(ContextMenuAction.pin)
      }
    },
    {},
    [isPinned]
  )

  useKey(
    (event) => {
      event.preventDefault()

      return event.keyCode === 46 || event.key === 'Backspace'
    },
    () => {
      props.onClick(ContextMenuAction.delete)
    }
  )

  return (
    <div className="space-y-2 -right-8 mt-2 w-60 rounded-lg bg-white shadow-md border text-sm text-gray-800 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600">
      <ul className="px-2 py-2 [&:not(:first-child)]:border-t dark:border-slate-600" role="menu">
        <li>
          <button
            onClick={() => props.onClick(ContextMenuAction.copyLink)}
            className="w-full cursor-pointer flex items-center gap-x-2 px-2 py-2 hover:bg-gray-50 active:bg-gray-100 rounded-lg group dark:hover:bg-slate-700"
            role="menuitem"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              width="18"
              height="18"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
              />
            </svg>

            <span>Copy link</span>

            <span className="text-gray-500 dark:text-slate-400 ml-auto">
              <div className="space-x-1">
                <kbd className="px-2 py-1 text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600">
                  C
                </kbd>
              </div>
            </span>
          </button>
        </li>

        {!isPinned && (
          <li>
            <button
              onClick={() => props.onClick(ContextMenuAction.pin)}
              className="w-full cursor-pointer flex items-center gap-x-2 px-2 py-2 hover:bg-gray-50 active:bg-gray-100 rounded-lg group dark:hover:bg-slate-700"
              role="menuitem"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" x2="12" y1="17" y2="22" />
                <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
              </svg>

              <span>Pin</span>

              <span className="text-gray-500 dark:text-slate-400 ml-auto">
                <div className="space-x-1">
                  <kbd className="px-2 py-1 text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    P
                  </kbd>
                </div>
              </span>
            </button>
          </li>
        )}

        {isPinned && (
          <li>
            <button
              onClick={() => props.onClick(ContextMenuAction.unpin)}
              className="w-full cursor-pointer flex items-center gap-x-2 px-2 py-2 hover:bg-gray-50 active:bg-gray-100 rounded-lg group dark:hover:bg-slate-700"
              role="menuitem"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="2" x2="22" y1="2" y2="22" />
                <line x1="12" x2="12" y1="17" y2="22" />
                <path d="M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h12" />
                <path d="M15 9.34V6h1a2 2 0 0 0 0-4H7.89" />
              </svg>

              <span>Unpin</span>

              <span className="text-gray-500 dark:text-slate-400 ml-auto">
                <div className="space-x-1">
                  <kbd className="px-2 py-1 text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    P
                  </kbd>
                </div>
              </span>
            </button>
          </li>
        )}

        <li>
          <button
            onClick={() => props.onClick(ContextMenuAction.edit)}
            className="w-full cursor-pointer flex items-center gap-x-2 px-2 py-2 hover:bg-gray-50 active:bg-gray-100 rounded-lg group dark:hover:bg-slate-700"
            role="menuitem"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
            </svg>

            <span>Edit</span>

            <span className="text-gray-500 dark:text-slate-400 ml-auto">
              <div className="space-x-1">
                <kbd className="px-2 py-1 text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600">
                  E
                </kbd>
              </div>
            </span>
          </button>
        </li>

        <li>
          <button
            onClick={() => props.onClick(ContextMenuAction.visit)}
            className="w-full cursor-pointer flex items-center gap-x-2 px-2 py-2 hover:bg-gray-50 active:bg-gray-100 rounded-lg group dark:hover:bg-slate-700"
            role="menuitem"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              width="18"
              height="18"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>

            <span>Visit</span>

            <span className="text-gray-500 dark:text-slate-400 ml-auto">
              <div className="space-x-1">
                <kbd className="px-2 py-1 text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600">
                  enter
                </kbd>
              </div>
            </span>
          </button>
        </li>

        <li>
          <button
            onClick={() => props.onClick(ContextMenuAction.delete)}
            className="w-full cursor-pointer flex items-center gap-x-2 px-2 py-2 hover:bg-gray-50 active:bg-gray-100 rounded-lg group dark:hover:bg-slate-700"
            role="menuitem"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              width="18"
              height="18"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z"
              />
            </svg>

            <span>Delete</span>

            <span className="text-gray-500 dark:text-slate-400 ml-auto">
              <div className="space-x-1">
                <kbd className="px-2 py-1 text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600">
                  delete
                </kbd>
              </div>
            </span>
          </button>
        </li>
      </ul>
    </div>
  )
}

export default LinkContextMenuContent
