import { Link } from '@/api/LinksApi'
import { useState } from 'react'
import { useKey } from 'react-use'

interface UseListCursorParams {
  links: Link[]
  disableArrowListeners?: boolean
}

export function useListCursor(params: UseListCursorParams) {
  const [cursor, setCursor] = useState<number | null>(null)

  function increment() {
    setCursor((prev) => {
      if (prev === null) {
        return 0
      }

      if (prev === params.links.length - 1) {
        return params.links.length - 1
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
      if (!params.disableArrowListeners) {
        event.preventDefault()
        decrement()
      }
    },
    {},
    [cursor, params.links, params.disableArrowListeners]
  )

  useKey(
    (event) => !event.ctrlKey && !event.metaKey && event.key === 'ArrowDown',
    (event) => {
      if (!params.disableArrowListeners) {
        event.preventDefault()
        increment()
      }
    },
    {},
    [cursor, params.links, params.disableArrowListeners]
  )

  return { cursor, setCursor, increment, decrement }
}
