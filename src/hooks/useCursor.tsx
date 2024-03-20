import { Link } from '@/api/LinksApi'
import { useState } from 'react'
import { useKey } from 'react-use'

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
    },
    {},
    [cursor, links]
  )

  useKey(
    (event) => !event.ctrlKey && !event.metaKey && event.key === 'ArrowDown',
    (event) => {
      event.preventDefault()
      increment()
    },
    {},
    [cursor, links]
  )

  return { cursor, setCursor, increment, decrement }
}
