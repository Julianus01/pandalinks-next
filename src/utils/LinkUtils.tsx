import { Link } from '@/api/AdminLinksApi'
import { DateUtils } from './DateUtils'
import _ from 'lodash/fp'

function splitByPinned(links: Link[]) {
  const [pinnedLinks, unpinnedLinks] = _.partition((link: Link) => {
    const isPinned = link.tags.includes('pinned')
    return isPinned
  })(links)

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
