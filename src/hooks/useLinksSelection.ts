import { useRouter } from 'next/router'
import { ParsedUrlQueryInput } from 'querystring'

export interface SetSelectionParams {
  selectedId?: string | undefined | null
  editLinkId?: string | undefined | null
}

export interface UseLinksSelection {
  selectedId: string
  editLinkId: string
  setSelectionParams: (params: SetSelectionParams) => void
}

export function useLinksSelection() {
  const router = useRouter()

  const selectedId = router.query.selectedId as string
  const editLinkId = router.query.editLinkId as string

  function setSelectionParams(params: SetSelectionParams) {
    router.replace({ query: objectToQueryString(params) }, undefined, { shallow: true })
  }

  return { selectedId, editLinkId, setSelectionParams }
}

function objectToQueryString(obj: any) {
  const keys = Object.keys(obj).filter(key => !!obj[key]);

  const keyValuePairs = keys.map(key => {
    return encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
  });

  return keyValuePairs.join('&');
}
