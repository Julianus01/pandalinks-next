import { Link, UpdateLinkRequestParams } from '@/api/LinksApi'
import { useTemporaryTrue } from '@/hooks/useTemporaryTrue'
import { ContentMenuUtils, ContextMenuAction, ContextMenuRow } from '@/utils/context-menu-utils'
import { LinkUtils } from '@/utils/link-utils'
import { Popover } from '@headlessui/react'
import classNames from 'classnames'
import Image from 'next/image'
import React, { useCallback } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useClickAway, useKey } from 'react-use'
import { toast } from 'sonner'

interface Props {
  link: Link
  isFirst: boolean
  isLast: boolean
  onClick: () => void
  onUpdate: (updatedLink: UpdateLinkRequestParams) => void
  useLinksHook: any
  navigateToLink: (link: Link) => void
}

function LinkRow(props: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const popoverPanelRef = useRef<HTMLDivElement>(null)

  const [title, setTitle] = useState<string>(props.link.title)
  const [url, setUrl] = useState<string>(props.link.url)
  const [isEditMode, setIsEditMode] = useState<boolean>(false)
  const [showCopied, showCopiedMessage] = useTemporaryTrue(1300)

  const isPinned = useMemo(() => {
    return props.link.tags.includes('pinned')
  }, [props.link.tags])

  useEffect(() => {
    if (!isEditMode && !url.length) {
      setUrl(props.link.url)
    }
  }, [isEditMode, props.link.url, url])

  useKey(
    'Escape',
    () => {
      if (isEditMode) {
        setUrl(props.link.url)
        setTitle(props.link.title)
      }
    },
    {},
    [isEditMode, props.link.url]
  )

  const onSaveEdit = useCallback(() => {
    const trimmedUrl = url.trim()
    const trimmedTitle = title.trim()

    if (isEditMode) {
      if (!trimmedUrl?.length || !trimmedTitle?.length) {
        setUrl(props.link.url)
        setTitle(props.link.title)
        toast('Title or url cannot be empty')
        setIsEditMode(false)

        return
      }

      if (trimmedUrl !== props.link.url || trimmedTitle !== props.link.title) {
        props.onUpdate({ uuid: props.link.uuid, url: trimmedUrl, title: trimmedTitle })
        setIsEditMode(false)

        return
      }

      setIsEditMode(false)
    }
  }, [url, title, isEditMode, props])

  useClickAway(ref, onSaveEdit)

  function onOptionClicked(contextMenuRow: ContextMenuRow) {
    switch (contextMenuRow.action) {
      case ContextMenuAction.visit: {
        props.navigateToLink(props.link)

        break
      }

      case ContextMenuAction.copyLink: {
        showCopiedMessage()
        navigator.clipboard.writeText(props.link.url)
        toast(
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75"
              />
            </svg>
            Copied to clipboard{' '}
          </>
        )

        break
      }

      case ContextMenuAction.pin: {
        props.useLinksHook.actions.pinLink(props.link.uuid)

        break
      }

      case ContextMenuAction.unpin: {
        props.useLinksHook.actions.unpinLink(props.link.uuid)

        break
      }

      // TODO: This scrolls the page to top in Safari
      case ContextMenuAction.edit: {
        setIsEditMode(true)

        break
      }

      case ContextMenuAction.delete: {
        props.useLinksHook.actions.deleteLink(props.link.uuid)

        break
      }
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter') {
      onSaveEdit()
    }
  }

  return (
    <div
      onKeyDown={onKeyDown}
      id={props.link.uuid}
      ref={ref}
      onClick={props.onClick}
      className={classNames({
        'pl-5 hover:bg-slate-100 cursor-pointer select-none flex border border-solid group dark:hover:bg-slate-700 border-slate-200 bg-white dark:border-slate-900 dark:bg-slate-800':
          true,
        'rounded-t-lg': props.isFirst,
        'rounded-b-lg': props.isLast,
      })}
    >
      <div className="relative pt-5 flex flex-col items-center mr-2">
        <div className="absolute top-5 right-0 bottom-0 left-0">
          <MemoLinkRowImage url={url} isEditMode={isEditMode} />
        </div>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4 text-rose-500"
        >
          <path
            fillRule="evenodd"
            d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      <div className={classNames({ 'flex flex-1 py-4 gap-2': true, 'flex-wrap': props.link.tags.length > 1 })}>
        {isEditMode && (
          <div className="flex-1 pr-4">
            <input
              onChange={(event) => setTitle(event.target.value)}
              value={title}
              autoFocus
              onFocus={(e) => e.target.select()}
              type="text"
              placeholder="Nike website"
              className="flex-1 focus:outline-none bg-transparent w-full text-gray-800 dark:text-slate-300"
            />

            <input
              onChange={(event) => setUrl(event.target.value)}
              value={url}
              onFocus={(e) => e.target.select()}
              type="text"
              placeholder="Nike.com"
              className="flex-1 focus:outline-none text-sm text-gray-400 dark:text-slate-400 bg-transparent w-full"
            />
          </div>
        )}

        {!isEditMode && (
          <div className="truncate space-y-1 mr-4">
            {showCopied && <div className="flex-1 text-gray-800 dark:text-slate-400">Copied to clipboard</div>}

            {!showCopied && (
              <p className="whitespace-normal text-gray-800 dark:text-slate-300">
                {isPinned && (
                  <span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4 text-yellow-500 inline-flex"
                    >
                      <line x1="12" x2="12" y1="17" y2="22" />
                      <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
                    </svg>
                  </span>
                )}
                {'  '}
                {title}
              </p>
            )}
          </div>
        )}

        {!isEditMode && (
          <div className="flex items-center space-x-2 ml-auto">
            {props.link.tags.map((tag) => {
              const tagColorClasses = LinkUtils.getRandomTagColorClasses(tag)

              return (
                <span
                  key={tag}
                  className={classNames({
                    'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset whitespace-nowrap':
                      true,
                    [tagColorClasses]: true,
                  })}
                >
                  #{tag}
                </span>
              )
            })}
          </div>
        )}
      </div>

      {!isEditMode && (
        <>
          <Popover className="relative">
            <Popover.Button onClick={(event) => event.stopPropagation()} className="outline-none">
              <div className="h-full flex pr-5 pl-3 items-center min-h-[56px]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5 text-gray-600 dark:text-slate-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                  />
                </svg>
              </div>
            </Popover.Button>

            <Popover.Overlay className="fixed inset-0 z-10" />

            <Popover.Panel
              ref={popoverPanelRef}
              onClick={(event) => event.stopPropagation()}
              onDoubleClick={(event) => event.stopPropagation()}
              className="absolute z-20 space-y-2 -right-8 mt-2 w-[270px] rounded-lg bg-white shadow-md border text-sm text-gray-800 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
            >
              {[ContentMenuUtils.getContextMenuGroupOne(props.link), ContentMenuUtils.getContextMenuGroupTwo()].map(
                (group, i) => (
                  <ul className="px-2 py-2 [&:not(:first-child)]:border-t dark:border-slate-700" role="menu" key={i}>
                    {group.map((contextMenuRow, idx) => (
                      <li key={idx}>
                        <button
                          onClick={() => onOptionClicked(contextMenuRow)}
                          className="w-full cursor-pointer flex items-center gap-x-2 px-2 py-2 hover:bg-gray-50 active:bg-gray-100 rounded-lg group dark:hover:bg-slate-700"
                          role="menuitem"
                        >
                          {contextMenuRow.icon && contextMenuRow.icon} {contextMenuRow.name}
                          <span className="text-gray-500 dark:text-slate-400 ml-auto">{contextMenuRow.command}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )
              )}
            </Popover.Panel>
          </Popover>
        </>
      )}
    </div>
  )
}

export default LinkRow

interface LinkRowImageProps {
  isEditMode: boolean
  url: string
}

function LinkRowImage(props: LinkRowImageProps) {
  return (
    <Image
      className={classNames({
        'bg-gray-50 group-hover:bg-gray-100': true,
        'bg-white group-hover:bg-white': props.isEditMode,
      })}
      alt="test"
      width={17}
      height={17}
      src={`https://www.google.com/s2/favicons?domain=${props.url}&sz=256`}
      onError={({ currentTarget }) => {
        currentTarget.onerror = null // prevents looping
        currentTarget.style.display = 'none'
      }}
    />
  )
}

const MemoLinkRowImage = React.memo(LinkRowImage)
