import { Link } from '@/api/LinksApi'
import { useState } from 'react'
import { useKey } from 'react-use'
import fp from 'lodash/fp'

export function useListCursor(links: Link[]) {
  const [cursor, setCursor] = useState<number | null>(null)

  function increment() {
    setCursor((prev) => {
      if (prev === null) {
        return 0
      }

      if (prev === links.length - 1) {
        return links.length - 1
      }

      return prev + 1
    })
  }

  function decrement() {
    setCursor((prev) => {
      if (prev === null) {
        return 0
      }

      if (prev === 0) {
        return 0
      }

      return prev - 1
    })
  }

  useKey(
    (event) => !event.ctrlKey && !event.metaKey && event.key === 'ArrowUp',
    (event) => {
      event.preventDefault()
      decrement()

      if (fp.isNumber(cursor) && fp.isNumber(cursor - 1)) {
        const element = document.getElementById(links[cursor - 1]?.uuid)

        if (element) {
          element.scrollIntoView({
            behavior: 'instant',
            inline: 'nearest',
            block: 'nearest',
          })
        }
      }
    },
    {},
    [cursor, links]
  )

  useKey(
    (event) => !event.ctrlKey && !event.metaKey && event.key === 'ArrowDown',
    (event) => {
      event.preventDefault()
      increment()

      if (fp.isNumber(cursor) && fp.isNumber(cursor + 1)) {
        const element = document.getElementById(links[cursor + 1]?.uuid)

        if (element) {
          element.scrollIntoView({
            behavior: 'instant',
            inline: 'nearest',
            block: 'nearest',
          })
        }
      }
    },
    {},
    [cursor, links]
  )

  return { cursor, setCursor, increment, decrement }
}
