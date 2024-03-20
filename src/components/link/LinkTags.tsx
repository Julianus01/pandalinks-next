import React, { useEffect, useMemo, useState } from 'react'
import fp from 'lodash/fp'
import { LinkUtils } from '@/utils/link-utils'
import classNames from 'classnames'

interface Props {
  tags: string[]
  isEditMode?: boolean
  className?: string
  onChange?: (tags: string[]) => void
  onFocus?: () => void
}

function LinkTags(props: Props) {
  const [tag, setTag] = useState<string>('')
  const [showInput, setShowInput] = useState<boolean>(false)

  const sortedTags = useMemo(() => {
    const hasPinned = props.tags.some((tag) => tag === 'pinned')

    if (!hasPinned) {
      return props.tags
    }

    const filtered = props.tags.filter((tag) => tag !== 'pinned')

    return [...filtered, 'pinned']
  }, [props.tags])

  function doesTagAlreadyExist(name: string): boolean {
    const found = sortedTags?.find((tag) => tag.toLowerCase() === name.toLowerCase())

    return Boolean(found)
  }

  function addTag() {
    const tagSnake = fp.kebabCase(tag)

    if (!tagSnake) {
      setShowInput(false)
      props.onFocus?.()
      return
    }

    if (!tagSnake || doesTagAlreadyExist(tagSnake)) {
      setTag('')
      return
    }

    props.onChange?.([tagSnake, ...sortedTags])
  }

  function removeTag(tagToRemove: string) {
    const newTags = sortedTags.filter((tag) => tag !== tagToRemove)

    props.onChange?.(newTags)
  }

  useEffect(() => {
    if (props.isEditMode) {
      setTag('')
    }
  }, [props.isEditMode, sortedTags])

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter') {
      event.stopPropagation()
      addTag()
    }
  }

  return (
    <div className="flex items-center justify-end gap-2 ml-auto flex-wrap">
      {sortedTags.map((tag) => {
        const tagColorClasses = LinkUtils.getRandomTagColorClasses(tag)

        return (
          <span
            onClick={() => props.isEditMode && removeTag(tag)}
            key={tag}
            className={classNames({
              'inline-flex items-center rounded-md px-2 py-0.5 text-xs ring-1 ring-inset whitespace-nowrap': true,
              [tagColorClasses]: true,
              'hover:opacity-70 dark:hover:opacity-70 cursor-pointer': props.isEditMode,
            })}
          >
            #{tag}
            {props.isEditMode && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            )}
          </span>
        )
      })}

      {props.isEditMode && (
        <>
          {!showInput && (
            <button
              onClick={() => setShowInput(true)}
              className="btn-default px-8 py-1 dark:hover:bg-gray-600 dark:hover:border-gray-600 rounded-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="10"
                height="10"
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
            </button>
          )}

          {showInput && (
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400 absolute left-2 inset-y-0 my-auto dark:text-slate-400"
              >
                <line x1="4" y1="9" x2="20" y2="9"></line>
                <line x1="4" y1="15" x2="20" y2="15"></line>
                <line x1="10" y1="3" x2="8" y2="21"></line>
                <line x1="16" y1="3" x2="14" y2="21"></line>
              </svg>

              <input
                onBlur={() => setShowInput(false)}
                onKeyDown={onKeyDown}
                autoFocus
                value={tag}
                onChange={(event) => setTag(event.target.value)}
                type="text"
                onFocus={(e) => e.target.select()}
                placeholder="research"
                className="w-28 font-light pl-6 pr-2 py-1 text-xs text-gray-700 bg-white outline-none border focus:ring-offset-0 focus:ring-2 focus:ring-slate-200 focus:border-slate-300 shadow-sm rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-slate-700"
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default LinkTags
