import { Link } from '@/api/AdminLinksApi'
import { DateUtils } from './DateUtils'

const partitionArr = (arr: any, condn: any) =>
  arr.reduce((acc: any, i: any) => (acc[condn(i) ? 0 : 1].push(i), acc), [[], []])

function splitByPinned(links: Link[]) {
  const [pinnedLinks, unpinnedLinks] = partitionArr(links, (link: Link) => {
    const isPinned = link.tags.includes('pinned')
    return isPinned
  })

  return [...pinnedLinks, ...unpinnedLinks]
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
