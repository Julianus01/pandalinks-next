import { LinkUtils } from '@/utils/link-utils'
import classNames from 'classnames'
import React, { useCallback } from 'react'

const ALL_TAG = 'all'

interface Props {
  tags: string[]
  selectedTags: string[]
  onChange: (tags: string[]) => void
}

function GlobalTagsSelector(props: Props) {
  const isTagSelected = useCallback(
    (tag: string) => props.selectedTags.some((selectedTag) => selectedTag === tag),
    [props.selectedTags]
  )

  function onClick(tag: string, selected: boolean) {
    if (selected) {
      return props.onChange([tag])
    }

    props.onChange([])

    // Code for having multiple tags at the same time
    // if (selected) {
    //   props.onChange([...props.selectedTags, tag])

    //   return
    // }

    // props.onChange(props.selectedTags.filter((selectedTag) => selectedTag !== tag))
  }

  const isAllSelected = Boolean(props.selectedTags.length === 0)
  const allTagColorClasses = LinkUtils.getRandomTagColorClasses(ALL_TAG)

  function onAllClick() {
    if (props.selectedTags.length) {
      props.onChange([])
    }
  }

  return (
    <div className="space-x-2 space-y-2 !mt-">
      {props.tags.length > 0 && (
        <span
          onClick={onAllClick}
          className={classNames({
            'inline-flex cursor-default items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset': true,
            'bg-gray-50 text-gray-800 ring-gray-600/20 hover:bg-gray-100 dark:text-slate-400 dark:bg-gray-800 dark:ring-gray-500/20 dark:hover:bg-gray-700':
              !isAllSelected,
            [allTagColorClasses]: isAllSelected,
          })}
        >
          #{ALL_TAG}
        </span>
      )}

      {props.tags.map((tag) => {
        const isSelected = isTagSelected(tag)
        const tagColorClasses = LinkUtils.getRandomTagColorClasses(tag)

        return (
          <span
            onClick={() => onClick(tag, !isSelected)}
            key={tag}
            className={classNames({
              'inline-flex cursor-default items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset':
                true,
              'bg-gray-50 text-gray-800 ring-gray-600/20 hover:bg-gray-100 dark:text-slate-400 dark:bg-gray-800 dark:ring-gray-500/20 dark:hover:bg-gray-700':
                !isSelected,
              [tagColorClasses]: isSelected,
            })}
          >
            #{tag}
          </span>
        )
      })}
    </div>
  )
}

export default GlobalTagsSelector
