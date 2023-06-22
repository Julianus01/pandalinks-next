import { Link } from '@/api/AdminLinksApi'
import { UpdateLinkRequestParams } from '@/api/LinksApi'
import { useTemporaryTrue } from '@/hooks/useTemporaryTrue'
import { DateUtils } from '@/utils/date-utils'
import { LinkUtils } from '@/utils/link-utils'
import { UrlUtils } from '@/utils/url-utils'
import classNames from 'classnames'
import fp from 'lodash/fp'
import Image from 'next/image'
import React, { useCallback } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
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
  const [title, setTitle] = useState<string>(props.link.title)
  const [url, setUrl] = useState<string>(props.link.url)
  const [showCopied, showCopiedMessage] = useTemporaryTrue(1300)

  const createdAtText = useMemo(() => {
    return DateUtils.timeSince(new Date(props.link.createdAt))
  }, [props.link.createdAt])

  const isValidUrl = useMemo(() => {
    return UrlUtils.isValidUrl(url)
  }, [url])

  const isPinned = useMemo(() => {
    return props.link.tags.includes('pinned')
  }, [props.link.tags])

  const displayUrl = useMemo(() => {
    return fp.compose(
      (url: string) => url.replace('www.', ''),
      (url: string) => url.replace('https://', ''),
      (url: string) => url.replace('http://', '')
    )(url)
  }, [url])

  useEffect(() => {
    if (!props.isEditMode && !url.length) {
      setUrl(props.link.url)
    }
  }, [props.isEditMode, props.link.url, url])

  // TODO: Make this work
  // useEffect(() => {
  //   let url = props.link.url

  //   if (!url.match(/^https?:\/\//i)) {
  //     url = `https://${url}`
  //   }

  //   axios
  //     .get('/api/url-metadata', { params: { url: url } })
  //     .then((response) => {
  //       console.log('Response')
  //       console.log(response.data)
  //     })
  //     .catch((error) => {
  //       console.log('Error here')
  //       console.log(error)
  //     })
  // }, [props.link.url])

  // CMD + C
  useKey(
    (event) => {
      return (event.ctrlKey || event.metaKey) && event.key === 'c'
    },
    () => {
      if (props.isSelected) {
        navigator.clipboard.writeText(url)
        showCopiedMessage()
      }
    }
  )

  const onSaveEdit = useCallback(() => {
    const trimmedUrl = url.trim()
    const trimmedTitle = title.trim()

    if (props.isEditMode) {
      if (!trimmedUrl?.length || !trimmedTitle?.length) {
        setUrl(props.link.url)
        setTitle(props.link.title)
        toast('Title or url cannot be empty')
        props.onExitEditMode()

        return
      }

      if (trimmedUrl !== props.link.url || trimmedTitle !== props.link.title) {
        if (!UrlUtils.isValidUrl(trimmedUrl)) {
          toast('Invalid Link')

          return
        }

        props.onUpdate({ id: props.link.id, url: trimmedUrl, title: trimmedTitle })
        props.onExitEditMode()

        return
      }

      props.onExitEditMode()
    }
  }, [url, title, props])

  useKey('Enter', onSaveEdit, {}, [props.isEditMode, title, url, props.link.url])
  useClickAway(ref, onSaveEdit)

  useKey(
    'Escape',
    () => {
      if (props.isEditMode) {
        setUrl(props.link.url)
        setTitle(props.link.title)
      }
    },
    {},
    [props.isEditMode, props.link.url]
  )

  return (
    <div
      ref={ref}
      onClick={props.onClick}
      onDoubleClick={props.onDoubleClick}
      onContextMenu={props.onContextMenu}
      className={classNames({
        'px-3 hover:bg-slate-100 rounded-lg cursor-default select-none flex border border-solid group': true,
        'border-slate-200 bg-white': !props.isSelected,
        'hover:border-slate-200 bg-slate-100 border border-solid border-slate-200 ring-offset-0 ring-2 ring-slate-200':
          props.isSelected || props.isEditMode,
      })}
    >
      <div className="relative pt-3 flex flex-col items-center mr-2">
        <div className="absolute top-3 right-0 bottom-0 left-0 z-1">
          {isValidUrl && <MemoLinkRowImage url={url} isEditMode={props.isEditMode} />}
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

        {isPinned && (
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
            className="w-3 h-3 text-yellow-500 mt-2.5"
          >
            <line x1="12" x2="12" y1="17" y2="22" />
            <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
          </svg>
        )}
      </div>

      {!props.isEditMode && (
        <div className="flex-1 truncate py-2 space-y-1 mr-4">
          {showCopied && <div className="flex-1">Copied to clipboard</div>}

          {!showCopied && <p className="whitespace-normal text-gray-800 flex-1">{title}</p>}
          <p className="truncate flex-1 text-xs text-gray-400">{displayUrl}</p>
        </div>
      )}

      {props.isEditMode && (
        <div className="flex-1 py-2">
          <input
            onChange={(event) => setTitle(event.target.value)}
            value={title}
            autoFocus
            onFocus={(e) => e.target.select()}
            type="text"
            placeholder="Nike website"
            className="flex-1 focus:outline-none bg-transparent w-full text-gray-800"
          />

          <input
            onChange={(event) => setUrl(event.target.value)}
            value={url}
            type="text"
            placeholder="Nike.com"
            className="flex-1 focus:outline-none text-sm text-gray-400 bg-transparent w-full"
          />
        </div>
      )}

      {!props.isEditMode && (
        <div className="flex items-center space-x-2 ml-auto">
          {props.link.tags.map((tag) => {
            const tagColorClasses = LinkUtils.getRandomTagColorClasses(tag)

            return (
              <span
                key={tag}
                className={classNames({
                  'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset': true,
                  [tagColorClasses]: true,
                })}
              >
                #{tag}
              </span>
            )
          })}

          <p className="ml-auto text-xs text-gray-800">{createdAtText}</p>
        </div>
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
