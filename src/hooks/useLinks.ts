import { Link } from '@/api/AdminLinksApi'
import { CreateLinkRequestParams, LinksApi, UpdateLinkRequestParams } from '@/api/LinksApi'
import { ReactQueryKey } from '@/api/ReactQueryKey'
import { AuthContext } from '@/context/AuthContext'
import { LinkUtils } from '@/utils/link-utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import fp from 'lodash/fp'
import { useContext, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useLinksSelection } from './useLinksSelection'

interface UseLinksParams {
  initialData?: Link[]
}

export function useLinks(params: UseLinksParams) {
  const queryClient = useQueryClient()
  const { user } = useContext(AuthContext)
  const linksSelection = useLinksSelection()

  const [searchQ, setSearchQ] = useState<string>('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const linksQuery = useQuery({
    queryKey: [ReactQueryKey.getLinks, user?.uid],
    queryFn: LinksApi.getLinks,
    initialData: params.initialData,
  })

  const links = useMemo(() => {
    return linksQuery.data || []
  }, [linksQuery.data])

  const filteredLinks = useMemo(() => {
    const query = searchQ.toLowerCase().trim()

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

        const isTitleMatch = link.title.toLowerCase().includes(query)
        const isUrlMatch = link.url.toLowerCase().includes(query)
        const hasTagMatch = !!link.tags.filter((tag) => tag.includes(query))?.length

        return isTitleMatch || isUrlMatch || hasTagMatch
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
    return filteredLinks.find((link) => link.id === linksSelection.selectedId)
  }, [filteredLinks, linksSelection.selectedId])

  const updateLinkMutation = useMutation({
    mutationFn: (updatedLink: UpdateLinkRequestParams) => LinksApi.updateLink(updatedLink),
  })

  const createLinkMutation = useMutation({
    mutationFn: (newLink: CreateLinkRequestParams) => LinksApi.createLink(newLink),
  })

  const deleteLinkMutation = useMutation({
    mutationFn: (linkId: string) => LinksApi.deleteLink(linkId),
  })

  function createLink(url: string) {
    setSearchQ('')

    const createPromise = createLinkMutation.mutateAsync(
      // TODO: Consider having it different
      // from the UI instead of mocked here? 🤔
      { url, title: 'My name needs an update 👈' },
      {
        onSuccess: (newLink) => {
          queryClient.setQueryData([ReactQueryKey.getLinks, user?.uid], (data) => {
            const oldLinks = data as Link[]

            const updatedLinks: Link[] = [newLink, ...oldLinks] as Link[]

            return LinkUtils.applyPinAndSortByCreatedAt(updatedLinks)
          })
        },
      }
    )

    toast.promise(createPromise, {
      loading: 'Creating link...',
      success: () => {
        return `Link has been created`
      },
      error: 'Something went wrong',
    })
  }

  function updateLink(updatedLink: UpdateLinkRequestParams) {
    const updatePromise = updateLinkMutation.mutateAsync(updatedLink, {
      onSuccess: () => {
        queryClient.setQueryData([ReactQueryKey.getLinks, user?.uid], (data) => {
          const oldLinks = data as Link[]

          const updatedLinks = oldLinks.map((oldLink) => {
            if (oldLink.id === updatedLink.id) {
              return { ...oldLink, ...updatedLink }
            }

            return oldLink
          })

          return LinkUtils.applyPinAndSortByCreatedAt(updatedLinks)
        })
      },
    })

    toast.promise(updatePromise, {
      loading: 'Updating link...',
      success: () => {
        return `Link has been updated`
      },
      error: 'Something went wrong',
    })
  }

  function deleteLink(linkId: string) {
    queryClient.setQueryData([ReactQueryKey.getLinks, user?.uid], (data) => {
      const oldLinks = data as Link[]

      const updatedLinks = oldLinks.filter((oldLink) => oldLink.id !== linksSelection.selectedId)

      return LinkUtils.applyPinAndSortByCreatedAt(updatedLinks)
    })

    if (linksSelection.selectedId) {
      const index = links.map((link) => link.id).indexOf(linksSelection.selectedId)

      if (links[index + 1]) {
        linksSelection.setSelectionParams({ selectedId: links[index + 1].id, editLinkId: null })
      } else if (links[index - 1]) {
        linksSelection.setSelectionParams({ selectedId: links[index - 1].id, editLinkId: null })
      }
    } else {
      linksSelection.setSelectionParams({ selectedId: null, editLinkId: null })
    }

    const deletePromise = deleteLinkMutation.mutateAsync(linkId)

    toast.promise(deletePromise, {
      loading: 'Removing link...',
      success: () => {
        return `Link has been removed`
      },
      error: 'Something went wrong',
    })
  }

  function pinLink(linkId: string) {
    const linkToPin = links.find((link) => link.id === linkId)

    toast('Pinned')

    if (linkToPin) {
      updateLinkMutation.mutate({ ...linkToPin, tags: [...new Set(linkToPin.tags), 'pinned'] })

      queryClient.setQueryData([ReactQueryKey.getLinks, user?.uid], (data) => {
        const oldLinks = data as Link[]

        const updatedLinks = oldLinks.map((link) => {
          if (link.id === linkId) {
            return {
              ...link,
              tags: [...new Set(linkToPin.tags), 'pinned'],
            }
          }

          return link
        })

        return LinkUtils.applyPinAndSortByCreatedAt(updatedLinks)
      })
    }
  }

  function unpinLink(linkId: string) {
    const linkToUnpin = links.find((link) => link.id === linkId)

    toast('Unpinned')

    if (linkToUnpin) {
      const newTags = linkToUnpin.tags.filter((tag) => tag !== 'pinned')

      updateLinkMutation.mutate({ ...linkToUnpin, tags: newTags })

      queryClient.setQueryData([ReactQueryKey.getLinks, user?.uid], (data) => {
        const oldLinks = data as Link[]

        const updatedLinks = oldLinks.map((link) => {
          if (link.id === linkId) {
            return {
              ...link,
              tags: newTags,
            }
          }

          return link
        })

        return LinkUtils.applyPinAndSortByCreatedAt(updatedLinks)
      })
    }
  }

  return {
    links: filteredLinks,
    isLoading: linksQuery.isLoading,

    searchQ: searchQ,
    allTags: allTags,
    selectedTags: selectedTags,
    selectedLink: selectedLink,

    actions: {
      setSearchQ: setSearchQ,
      setSelectedTags: setSelectedTags,

      createLink: createLink,
      updateLink: updateLink,
      deleteLink: deleteLink,

      pinLink: pinLink,
      unpinLink: unpinLink,
    },

    mutations: {
      createLinkMutation: createLinkMutation,
      updateLinkMutation: updateLinkMutation,
      deleteLinkMutation: deleteLinkMutation,
    },
  }
}
