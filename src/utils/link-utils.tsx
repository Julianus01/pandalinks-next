import { Link } from '@/api/AdminLinksApi'
import { DateUtils } from './date-utils'
import { CommonUtils } from './common-utils'

function splitByPinned(links: Link[]) {
  const [pinnedLinks, unpinnedLinks] = CommonUtils.partition(links, (link: Link) => {
    const isPinned = link.tags.includes('pinned')
    return isPinned
  })

  return [...pinnedLinks, ...unpinnedLinks] as Link[]
}

function sortByVisitedAt(links: Link[]) {
  return links.sort((first: Link, second: Link) => {
    return (
      DateUtils.dateFromFBTimestamp(first.visitedAt).valueOf() -
      DateUtils.dateFromFBTimestamp(second.visitedAt).valueOf()
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
