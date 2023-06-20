import { Link } from '@/api/AdminLinksApi'
import { UpdateLinkRequestParams } from '@/api/LinksApi'
import { useTemporaryTrue } from '@/hooks/useTemporaryTrue'
import { DateUtils } from '@/utils/date-utils'
import { UrlUtils } from '@/utils/url-utils'
import axios from 'axios'
import classNames from 'classnames'
import fp from 'lodash/fp'
import Image from 'next/image'
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
  const [value, setValue] = useState<string>(props.link.url)
  const [showCopied, showCopiedMessage] = useTemporaryTrue(1300)

  const lastVisitedText = useMemo(() => {
    return DateUtils.timeSince(new Date(props.link.visitedAt))
  }, [props.link.visitedAt])

  const isPinned = useMemo(() => {
    return props.link.tags.includes('pinned')
  }, [props.link.tags])

  const displayValue = useMemo(() => {
    return fp.compose(
      (value: string) => value.replace('www.', ''),
      (value: string) => value.replace('https://', ''),
      (value: string) => value.replace('http://', '')
    )(value)
  }, [value])

  useEffect(() => {
    if (!props.isEditMode && !value.length) {
      setValue(props.link.url)
    }
  }, [props.isEditMode, props.link.url, value])

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
        navigator.clipboard.writeText(value)
        showCopiedMessage()
      }
    }
  )

  useKey(
    'Enter',
    () => {
      const trimmedValue = value.trim()

      if (!trimmedValue?.length) {
        setValue(props.link.url)
        props.onExitEditMode()

        return
      }

      if (props.isEditMode && trimmedValue !== props.link.url) {
        if (!UrlUtils.isValidUrl(trimmedValue)) {
          toast('Invalid Link')

          return
        }

        props.onUpdate({ id: props.link.id, url: trimmedValue })
        props.onExitEditMode()
      }
    },
    {},
    [props.isEditMode, value, props.link.url]
  )

  useClickAway(ref, () => {
    const trimmedValue = value.trim()

    if (props.isEditMode) {
      if (!trimmedValue?.length) {
        setValue(props.link.url)
        props.onExitEditMode()

        return
      }

      if (trimmedValue !== props.link.url) {
        if (!UrlUtils.isValidUrl(trimmedValue)) {
          setValue(props.link.url)
          toast('Invalid Link')
          props.onExitEditMode()

          return
        }

        props.onUpdate({ id: props.link.id, url: trimmedValue })
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
        'px-3 hover:bg-gray-100 rounded-lg cursor-pointer -mx-1.5 flex items-center border border-solid group': true,
        'border-gray-50': !props.isSelected,
        'hover:border-gray-200 bg-gray-100 border border-solid border-gray-200': props.isSelected,
        'cursor-default bg-white hover:bg-white shadow-sm': props.isEditMode,
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

      {!showCopied && !props.isEditMode && <p className="py-2 pr-4 truncate flex-1">{displayValue}</p>}

      {showCopied && <div className="py-2 flex items-center">Copied to clipboard</div>}

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

      {!props.isEditMode && (
        <>
          <div className="flex items-center space-x-2 ml-auto">
            {isPinned && (
              <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                #pinned
              </span>
            )}

            {!isPinned &&
              props.link.tags.map((tag) => {
                const tagColorClasses = getRandomColor(tag)

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

            <p className="ml-auto text-xs">{lastVisitedText}</p>
          </div>
        </>
      )}
    </div>
  )
}

export default LinkRow

const COLORS = [
  'bg-slate-50 text-slate-800 ring-slate-600/20',
  'bg-gray-50 text-gray-800 ring-gray-600/20',
  'bg-neutral-50 text-neutral-800 ring-neutral-600/20',
  'bg-stone-50 text-stone-800 ring-stone-600/20',
  'bg-red-50 text-red-800 ring-red-600/20',
  'bg-orange-50 text-orange-800 ring-orange-600/20',
  'bg-amber-50 text-amber-800 ring-amber-600/20',
  'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
  'bg-lime-50 text-lime-800 ring-lime-600/20',
  'bg-green-50 text-green-800 ring-green-600/20',
  'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
  'bg-teal-50 text-teal-800 ring-teal-600/20',
  'bg-cyan-50 text-cyan-800 ring-cyan-600/20',
  'bg-sky-50 text-sky-800 ring-sky-600/20',
  'bg-blue-50 text-blue-800 ring-blue-600/20',
  'bg-indigo-50 text-indigo-800 ring-indigo-600/20',
  'bg-violet-50 text-violet-800 ring-violet-600/20',
  'bg-purple-50 text-purple-800 ring-purple-600/20',
  'bg-fuchsia-50 text-fuchsia-800 ring-fuchsia-600/20',
  'bg-pink-50 text-pink-800 ring-pink-600/20',
  'bg-rose-50 text-rose-800 ring-rose-600/20',
]

const getRandomColor = (seed: string) => {
  const rand = parseInt(seed, 36)

  return COLORS[rand ? rand % COLORS.length : 0]
}
