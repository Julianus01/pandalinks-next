import { Bookmark, HTMLBookmark, Link } from '@/api/AdminLinksApi'
import fp from 'lodash/fp'

function splitByPinned(links: Link[]) {
  const [pinnedLinks, unpinnedLinks] = fp.partition((link: Link) => {
    const isPinned = link.tags.includes('pinned')
    return isPinned
  })(links)

  return [...pinnedLinks, ...unpinnedLinks] as Link[]
}

function sortByCreatedAt(links: Link[]) {
  return links.sort((first: Link, second: Link) => {
    return new Date(second.createdAt).valueOf() - new Date(first.createdAt).valueOf()
  })
}

function applyPinAndSortByCreatedAt(links: Link[]) {
  const sorted = sortByCreatedAt(links)
  const sortedAndSplitByPinned = splitByPinned(sorted)

  return sortedAndSplitByPinned
}

function getBookmarksFromImportedJson(json: HTMLBookmark[]): Bookmark[] {
  const result: Bookmark[] = json?.flatMap((item: any) => {
    if (item.type === 'folder') {
      const currentTag = item.title.replace(/\s+/g, '-').toLowerCase()

      if (currentTag === 'bookmarks-bar') {
        return getBookmarksFromImportedJson(item?.children || [])
      }

      const childItems = getBookmarksFromImportedJson(item?.children || [])

      const withExtraTag = childItems.map((item) => ({
        ...item,
        tags: [...new Set([...(item?.tags || []), currentTag])],
      }))

      return withExtraTag
    }

    if (item.type === 'link') {
      const childrenItems = getBookmarksFromImportedJson(item?.children || [])

      if (childrenItems.length) {
        return [item, childrenItems]
      }

      return item
    }

    return []
  })

  return result
}

const TAG_COLOR_CLASSES = [
  'bg-red-50 text-red-800 ring-red-600/20 dark:bg-red-100 dark:opacity-90',
  'bg-orange-50 text-orange-800 ring-orange-600/20 dark:bg-orange-100 dark:opacity-90',
  'bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-100 dark:opacity-90',
  'bg-yellow-50 text-yellow-800 ring-yellow-600/20 dark:bg-yellow-100 dark:opacity-90',
  'bg-lime-50 text-lime-800 ring-lime-600/20 dark:bg-lime-100 dark:opacity-90',
  'bg-green-50 text-green-800 ring-green-600/20 dark:bg-green-100 dark:opacity-90',
  'bg-emerald-50 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-100 dark:opacity-90',
  'bg-teal-50 text-teal-800 ring-teal-600/20 dark:bg-teal-100 dark:opacity-90',
  'bg-cyan-50 text-cyan-800 ring-cyan-600/20 dark:bg-cyan-100 dark:opacity-90',
  'bg-sky-50 text-sky-800 ring-sky-600/20 dark:bg-sky-100 dark:opacity-90',
  'bg-blue-50 text-blue-800 ring-blue-600/20 dark:bg-blue-100 dark:opacity-90',
  'bg-indigo-50 text-indigo-800 ring-indigo-600/20 dark:bg-indigo-100 dark:opacity-90',
  'bg-violet-50 text-violet-800 ring-violet-600/20 dark:bg-violet-100 dark:opacity-90',
  'bg-purple-50 text-purple-800 ring-purple-600/20 dark:bg-purple-100 dark:opacity-90',
  'bg-fuchsia-50 text-fuchsia-800 ring-fuchsia-600/20 dark:bg-fuchsia-100 dark:opacity-90',
  'bg-pink-50 text-pink-800 ring-pink-600/20 dark:bg-pink-100 dark:opacity-90',
  'bg-rose-50 text-rose-800 ring-rose-600/20 dark:bg-rose-100 dark:opacity-90',
]

const getRandomTagColorClasses = (tag: string) => {
  if (tag === 'pinned') {
    return 'bg-yellow-50 text-yellow-800 ring-yellow-600/20 dark:bg-yellow-100 dark:opacity-90'
  }

  const rand = parseInt(tag, 36)

  return TAG_COLOR_CLASSES[rand ? rand % TAG_COLOR_CLASSES.length : 0]
}

export const LinkUtils = {
  splitByPinned,
  sortByCreatedAt,
  applyPinAndSortByCreatedAt,
  getBookmarksFromImportedJson,
  getRandomTagColorClasses,
}
