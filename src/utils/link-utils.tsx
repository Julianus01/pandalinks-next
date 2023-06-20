import { Bookmark, HTMLBookmark, Link } from '@/api/AdminLinksApi'
import fp from 'lodash/fp'

function splitByPinned(links: Link[]) {
  const [pinnedLinks, unpinnedLinks] = fp.partition((link: Link) => {
    const isPinned = link.tags.includes('pinned')
    return isPinned
  })(links)

  return [...pinnedLinks, ...unpinnedLinks] as Link[]
}

function sortByVisitedAt(links: Link[]) {
  return links.sort((first: Link, second: Link) => {
    return new Date(second.visitedAt).valueOf() - new Date(first.visitedAt).valueOf()
  })
}

function applyPinAndSortByVisitedAt(links: Link[]) {
  const sorted = sortByVisitedAt(links)
  const sortedAndSplitByPinned = splitByPinned(sorted)

  return sortedAndSplitByPinned
}

function getBookmarksFromImportedJson(json: HTMLBookmark[]): Bookmark[] {
  const result: Bookmark[] = json?.flatMap((item: any) => {
    if (item.type === 'folder') {
      return getBookmarksFromImportedJson(item?.children || [])
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
  sortByVisitedAt,
  applyPinAndSortByVisitedAt,
  getBookmarksFromImportedJson,
}
