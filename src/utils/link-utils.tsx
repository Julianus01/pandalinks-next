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

export const LinkUtils = {
  splitByPinned,
  sortByCreatedAt,
  applyPinAndSortByCreatedAt,
  getBookmarksFromImportedJson,
}
