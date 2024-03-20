import { Link, UpdateLinkRequestParams } from '@/api/LinksApi'
import { useTemporaryTrue } from '@/hooks/useTemporaryTrue'
import { LinkUtils } from '@/utils/link-utils'
import classNames from 'classnames'
import Image from 'next/image'
import React, { useCallback } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useClickAway, useKey } from 'react-use'
import { toast } from 'sonner'
import * as ContextMenu from '@radix-ui/react-context-menu'
import LinkContextMenuContent, { ContextMenuAction } from './LinkContextMenuContext'

interface Props {
  link: Link
  isSelected: boolean
  isFirst: boolean
  isLast: boolean
  onClick: () => void
  onUpdate: (updatedLink: UpdateLinkRequestParams) => void
  useLinksHook: any
  navigateToLink: (link: Link) => void
}

function LinkRow(props: Props) {
  const ref = useRef<HTMLDivElement>(null)

  const [title, setTitle] = useState<string>(props.link.title)
  const [url, setUrl] = useState<string>(props.link.url)
  const [isEditMode, setIsEditMode] = useState<boolean>(false)
  const [showCopied, showCopiedMessage] = useTemporaryTrue(1300)
  const [isContextOpen, setIsContextOpen] = useState<boolean>(false)

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

  function onContextMenuAction(action: ContextMenuAction) {
    switch (action) {
      case ContextMenuAction.visit: {
        props.navigateToLink(props.link)

        // Close context menu hack
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

        break
      }

      case ContextMenuAction.copyLink: {
        showCopiedMessage()
        navigator.clipboard.writeText(props.link.url)

        // Close context menu hack
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

        break
      }

      case ContextMenuAction.pin: {
        props.useLinksHook.actions.pinLink(props.link.uuid)

        // Close context menu hack
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

        break
      }

      case ContextMenuAction.unpin: {
        props.useLinksHook.actions.unpinLink(props.link.uuid)

        // Close context menu hack
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

        break
      }

      case ContextMenuAction.edit: {
        // Close context menu hack
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

        setTimeout(() => {
          setIsEditMode(true)
        }, 0)

        break
      }

      case ContextMenuAction.delete: {
        props.useLinksHook.actions.deleteLink(props.link.uuid)

        // Close context menu hack
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

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
    <ContextMenu.Root onOpenChange={setIsContextOpen}>
      <ContextMenu.Trigger asChild>
        <div
          onKeyDown={onKeyDown}
          id={props.link.uuid}
          ref={ref}
          onClick={() => !isEditMode && props.onClick()}
          className={classNames({
            'px-5  cursor-pointer select-none flex border border-solid group  border-slate-200 dark:border-slate-900':
              true,
            'bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700':
              !isContextOpen && !isEditMode && !props.isSelected,
            'bg-gray-50 dark:bg-slate-700': isContextOpen || isEditMode || props.isSelected,
            'rounded-t-lg': props.isFirst,
            'rounded-b-lg': props.isLast,
          })}
        >
          <div className="relative pt-4 flex flex-col items-center mr-2">
            <div className="absolute top-4 right-0 bottom-0 left-0">
              <MemoLinkRowImage url={url} isEditMode={isEditMode} />
            </div>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-800 dark:text-slate-400"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          </div>

          <div className={classNames({ 'flex flex-1 py-3 gap-2': true, 'flex-wrap': props.link.tags.length > 1 })}>
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
                {showCopied && <div className="flex-1 text-gray-800 dark:text-slate-200">Copied to clipboard</div>}

                {!showCopied && <p className="whitespace-normal text-gray-800 dark:text-slate-300">{title}</p>}
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
                        'inline-flex items-center rounded-md px-2 py-1 text-xs ring-1 ring-inset whitespace-nowrap':
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
        </div>
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content data-state={isContextOpen ? 'open' : 'closed'} className="ContextMenuContent">
          <LinkContextMenuContent link={props.link} onClick={onContextMenuAction} />
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
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
