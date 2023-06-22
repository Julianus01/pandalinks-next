import { useRouter } from 'next/router'
import { ParsedUrlQueryInput } from 'querystring'

export interface SetSelectionParams {
  selectedId?: string | undefined | null
  editLinkId?: string | undefined | null
}

export function useLinksSelection() {
  const router = useRouter()

  const selectedId = router.query.selectedId as string
  const editLinkId = router.query.editLinkId as string

  function setSelectionParams(params: SetSelectionParams) {
    router.replace({ query: params as ParsedUrlQueryInput }, undefined, { shallow: true })
  }

  return { selectedId, editLinkId, setSelectionParams }
}
