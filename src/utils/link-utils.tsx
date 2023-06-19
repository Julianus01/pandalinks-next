import { Link } from '@/api/AdminLinksApi'
import { DateUtils } from './date-utils'
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
    return (
      DateUtils.dateFromFBTimestamp(second.visitedAt).valueOf() -
      DateUtils.dateFromFBTimestamp(first.visitedAt).valueOf()
    )
  })
}

function applyPinAndSortByVisitedAt(links: Link[]) {
  const sorted = sortByVisitedAt(links)
  const sortedAndSplitByPinned = splitByPinned(sorted)

  return sortedAndSplitByPinned
}

function mapTimestampPropertiesToDate(link: Link) {
  return {
    ...link,
    createdAt: link.createdAt.toDate(),
    updatedAt: link.updatedAt.toDate(),
    visitedAt: link.visitedAt.toDate(),
  }
}

export const LinkUtils = {
  splitByPinned,
  sortByVisitedAt,
  applyPinAndSortByVisitedAt,
  mapTimestampPropertiesToDate,
}
