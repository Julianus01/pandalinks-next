import { Link } from '@/api/AdminLinksApi'
import { LinksApi } from '@/api/LinksApi'
import { ReactQueryKey } from '@/api/ReactQueryKey'
import { AuthContext } from '@/context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import fp from 'lodash/fp'
import { useContext, useMemo, useState } from 'react'

interface UseLinksParams {
  initialData?: Link[]
}

export function useLinks(params: UseLinksParams) {
  const { user } = useContext(AuthContext)
  const [searchQ, setSearchQ] = useState<string>('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editLinkId, setEditLinkId] = useState<string | null>(null)

  const linksQuery = useQuery({
    queryKey: [ReactQueryKey.getLinks, user?.uid],
    queryFn: LinksApi.getLinks,
    initialData: params.initialData,
  })

  const links = useMemo(() => {
    return linksQuery.data || []
  }, [linksQuery.data])

  const filteredLinks = useMemo(() => {
    const query = searchQ.toLowerCase()

    return fp.compose(
      fp.filter((link: Link) => {
        if (!selectedTags.length) {
          return true
        }

        return link.tags.some((tag) => selectedTags.includes(tag))
      }),
      fp.filter((link: Link) => {
        if (!searchQ) {
          return true
        }

        const isUrlMatch = link.url.toLowerCase().includes(query)
        const hasTagMatch = !!link.tags.filter((tag) => tag.includes(query))?.length

        return isUrlMatch || hasTagMatch
      })
    )(links)
  }, [links, searchQ, selectedTags])

  const allTags = useMemo(() => {
    return fp.compose(
      fp.uniq,
      fp.flatMap((link: Link) => link.tags)
    )(links)
  }, [links])

  const selectedLink = useMemo(() => {
    return filteredLinks.find((link) => link.id === selectedId)
  }, [filteredLinks, selectedId])

  return {
    links: filteredLinks,
    isLoading: linksQuery.isLoading,

    searchQ: searchQ,
    allTags: allTags,
    selectedTags: selectedTags,
    selectedLink: selectedLink,
    selectedId: selectedId,
    editLinkId: editLinkId,
    actions: {
      setSearchQ: setSearchQ,
      setSelectedTags: setSelectedTags,
      setSelectedId: setSelectedId,
      setEditLinkId: setEditLinkId,
    },
  }
}
