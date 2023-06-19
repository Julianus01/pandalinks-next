import { Link, LinkDb } from '@/api/AdminLinksApi'
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
    return second.visitedAt.valueOf() - first.visitedAt.valueOf()
  })
}

function applyPinAndSortByVisitedAt(links: Link[]) {
  const sorted = sortByVisitedAt(links)
  const sortedAndSplitByPinned = splitByPinned(sorted)

  return sortedAndSplitByPinned
}

function mapTimestampPropertiesToDateString(link: LinkDb) {
  return {
    ...link,
    createdAt: link.createdAt.toDate().toString(),
    updatedAt: link.updatedAt.toDate().toString(),
    visitedAt: link.visitedAt.toDate().toString(),
  }
}

export const LinkUtils = {
  splitByPinned,
  sortByVisitedAt,
  applyPinAndSortByVisitedAt,
  mapTimestampPropertiesToDateString,
}
