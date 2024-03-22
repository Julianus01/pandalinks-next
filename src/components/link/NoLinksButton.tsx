import { Link, LinksApi } from '@/api/LinksApi'
import { ReactQueryKey } from '@/api/ReactQueryKey'
import { SupabaseAuthContext } from '@/context/SupabaseAuthContext'
import { LinkUtils } from '@/utils/link-utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'
import { toast } from 'sonner'

function getNewLinks(userId: string): Partial<Link>[] {
  return [
    {
      title: 'This shoe is iconic 👟',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      user_id: userId,
      tags: ['friday'],
    },
    {
      title: 'This is magic 🪄',
      url: 'https://www.youtube.com/watch?v=Y8F-s23myIM',
      user_id: userId,
      tags: [],
    },
    {
      title: '10x Software Engineer testing strategy 🧪',
      url: 'https://9gag.com/gag/avQg8jd',
      user_id: userId,
      tags: [],
    },
    {
      title: 'Zuck pretends to be human with his human fellows 👽',
      url: 'https://www.youtube.com/watch?v=eBxTEoseZak',
      user_id: userId,
      tags: ['totally-human'],
    },
    {
      title: 'TGIF 🎉',
      url: 'https://9gag.com/gag/aP38QqR',
      user_id: userId,
      tags: ['friday', 'pinned'],
    },
  ]
}

function NoLinksButton() {
  const queryClient = useQueryClient()
  const { user } = useContext(SupabaseAuthContext)

  const batchCreateLinksMutation = useMutation({
    mutationFn: (newLinks: Partial<Link>[]) => LinksApi.batchCreateLinks(newLinks),
  })

  function generateLinks() {
    const createPromise = batchCreateLinksMutation.mutateAsync(getNewLinks(user?.id as string), {
      onSuccess: (responseLinks) => {
        queryClient.setQueryData([ReactQueryKey.getLinks, user?.id], (data) => {
          const oldLinks = data as Link[]

          const updatedLinks: Link[] = [...(responseLinks as Link[]), ...oldLinks] as Link[]

          return LinkUtils.applyPinAndSortByCreatedAt(updatedLinks)
        })
      },
    })

    toast.promise(createPromise, {
      loading: 'Generating bookmarks...',
      success: () => {
        return `Generated Bookmarks`
      },
      error: () => {
        return 'Something went wrong'
      },
    })
  }

  return (
    <button
      onClick={generateLinks}
      disabled={batchCreateLinksMutation.isPending}
      className="flex items-center space-x-2 text-blue-500 hover:text-blue-600 dark:text-blue-400
        dark:hover:text-blue-500 text-sm px-2 py-1 disabled:pointer-events-none"
    >
      <p>Empty? Generate some fun bookmarks for me</p>

      {batchCreateLinksMutation.isPending ? (
        <svg
          className="animate-spin text-gray-500 dark:text-slate-300"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="2" x2="12" y2="6"></line>
          <line x1="12" y1="18" x2="12" y2="22"></line>
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
          <line x1="2" y1="12" x2="6" y2="12"></line>
          <line x1="18" y1="12" x2="22" y2="12"></line>
          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
          <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
        </svg>
      ) : (
        <p>👈</p>
      )}
    </button>
  )
}

export default NoLinksButton
