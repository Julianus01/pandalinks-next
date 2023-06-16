import { AdminLinksApi, Link } from '@/api/AdminLinksApi'
import { CreateLinkRequestParams, LinksApi, UpdateLinkRequestParams } from '@/api/LinksApi'
import { ReactQueryKey } from '@/api/ReactQueryKey'
import AuthLayout from '@/components/shared/AuthLayout'
import LinkRow from '@/components/Links/LinkRow'
import SearchLinksInput from '@/components/Links/SearchLinksInput'
import { withAuth } from '@/firebase/withAuth'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useRef, useState } from 'react'
import { useClickAway, useKey } from 'react-use'
import { toast } from 'sonner'
import LinkRowAdd from '@/components/Links/LinkRowAdd'

function HomePage() {
  const queryClient = useQueryClient()
  const [showAddRow, setShowAddRow] = useState<boolean>(false)
  const [searchQ, setSearchQ] = useState<string>('')
  const [selected, setSelected] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState<boolean>(false)
  const linksContainerRef = useRef(null)

  const contextMenuRef = useRef<HTMLDivElement>(null)
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const linksQuery = useQuery({
    queryKey: [ReactQueryKey.getLinks],
    queryFn: LinksApi.getLinks,
    initialData: [],
  })

  const updateLinkMutation = useMutation({
    mutationFn: (updatedLink: UpdateLinkRequestParams) => LinksApi.updateLink(updatedLink),
  })

  const createLinkMutation = useMutation({
    mutationFn: (newLink: CreateLinkRequestParams) => LinksApi.createLink(newLink),
  })

  const deleteLinkMutation = useMutation({
    mutationFn: (linkId: string) => LinksApi.deleteLink(linkId),
  })

  // Close context menu when clicking away
  useClickAway(contextMenuRef, resetContextMenu)

  useKey('Escape', () => {
    setShowContextMenu(false)
    setSelected(null)
  })

  useKey(
    'Enter',
    () => {
      if (selected && !isEditMode) {
        setIsEditMode(true)
      }
    },
    {},
    [selected, isEditMode]
  )

  // Delete Key
  useKey(
    (event) => {
      return (event.ctrlKey || event.metaKey) && (event.keyCode === 46 || event.key === 'Backspace')
    },
    () => {
      if (selected) {
        queryClient.setQueryData([ReactQueryKey.getLinks], (data) => {
          const oldLinks = data as Link[]
          return oldLinks.filter((oldLink) => oldLink.id !== selected)
        })
        const deletePromise = deleteLinkMutation.mutateAsync(selected)
        toast.promise(deletePromise, {
          loading: 'Removing link...',
          success: () => {
            return `Link has been removed`
          },
          error: 'Something went wrong',
        })
      }
    },
    {},
    [selected]
  )

  useClickAway(linksContainerRef, () => {
    setSelected(null)
  })

  function onUpdateLink(updatedLink: UpdateLinkRequestParams) {
    const updatePromise = updateLinkMutation.mutateAsync(updatedLink, {
      onSuccess: () => {
        queryClient.setQueryData([ReactQueryKey.getLinks], (data) => {
          const oldLinks = data as Link[]

          const updatedLinks = oldLinks.map((oldLink) => {
            if (oldLink.id === updatedLink.id) {
              return { ...oldLink, ...updatedLink }
            }

            return oldLink
          })

          return updatedLinks
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

  function onCreateLink(src: string) {
    setSearchQ('')

    const createPromise = createLinkMutation.mutateAsync(
      { src },
      {
        onSuccess: (newLink) => {
          queryClient.setQueryData([ReactQueryKey.getLinks], (data) => {
            const oldLinks = data as Link[]

            return [newLink, ...oldLinks]
          })

          setShowAddRow(false)
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

  const filteredLinks = useMemo(() => {
    if (!searchQ) {
      return linksQuery.data
    }

    return linksQuery.data.filter((link) => link.src.toLowerCase().includes(searchQ.toLowerCase()))
  }, [linksQuery.data, searchQ])

  function handleContextMenu(e: React.MouseEvent<HTMLDivElement>, link: Link) {
    setSelected(link.id)
    e.preventDefault()
    const { pageX, pageY } = e
    setShowContextMenu(true)
    setTimeout(() => {
      if (contextMenuRef?.current) {
        const rect = contextMenuRef.current.getBoundingClientRect()
        const x = pageX + rect.width > window.innerWidth ? window.innerWidth - rect.width : pageX + 2
        const y = pageY + rect.height > window.innerHeight ? window.innerHeight - rect.height : pageY + 2
        setPosition({ x, y })
        contextMenuRef?.current?.classList.remove('opacity-0')
        document.documentElement.classList.add('overflow-hidden')
      }
    }, 100)
  }

  function resetContextMenu() {
    setShowContextMenu(false)
    document.documentElement.classList.remove('overflow-hidden')
  }

  function navigateToLink(link: Link) {
    if (!link.src.match(/^https?:\/\//i)) {
      return window.open(`http://${link.src}`, '_blank')
    }
    return window.open(link.src, '_blank')
  }

  console.log({ selected, isEditMode })

  return (
    <AuthLayout>
      <div className="w-full max-w-3xl h-16 px-5 mx-auto pt-20">
        <div className="flex space-x-2 mb-6">
          <SearchLinksInput
            onCreate={onCreateLink}
            value={searchQ}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearchQ(event.target.value)}
          />

          <button
            onClick={() => setShowAddRow(true)}
            className="px-3 flex gap-1 items-center py-1.5 bg-white text-sm text-gray-700 duration-100 border rounded-lg hover:bg-gray-50 active:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>

        <div ref={linksContainerRef} className="space-y-1">
          {showAddRow && <LinkRowAdd onClose={() => setShowAddRow(false)} onCreate={onCreateLink} />}

          {filteredLinks.map((link: Link) => {
            const isSelected = selected === link.id

            return (
              <LinkRow
                onUpdate={onUpdateLink}
                onExitEditMode={() => setIsEditMode(false)}
                onUnselect={() => setSelected(null)}
                isEditMode={isEditMode && isSelected}
                onContextMenu={(event) => handleContextMenu(event, link)}
                link={link}
                key={link.id}
                onClick={() => {
                  setSelected(link.id)
                  setIsEditMode(false)
                }}
                onDoubleClick={() => navigateToLink(link)}
                isSelected={isSelected}
              />
            )
          })}
        </div>
      </div>

      {showContextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed z-10 opacity-0 max-w-[17rem] w-full rounded-lg bg-white shadow-md border text-sm text-gray-800"
          style={{ top: `${position.y}px`, left: `${position.x}px` }}
        >
          <ul className="px-2 py-1.5" role="menu">
            {menuItems.group_1.map((item, idx) => (
              <li key={idx}>
                <button
                  className="w-full flex items-center justify-between gap-x-2 px-2 py-1.5  hover:bg-gray-50 active:bg-gray-100 rounded-lg group cursor-pointer"
                  role="menuitem"
                >
                  {item.name}

                  <span className="text-gray-500">{item.command}</span>
                </button>
              </li>
            ))}
          </ul>

          {[menuItems.group_2, menuItems.group_3, menuItems.group_4].map((group, i) => (
            <ul className="px-2 py-1.5 border-t" role="menu" key={i}>
              {group.map((item, idx) => (
                <li key={idx}>
                  <button
                    className="w-full flex items-center justify-between gap-x-2 px-2 py-1.5  hover:bg-gray-50 active:bg-gray-100 rounded-lg group cursor-pointer"
                    role="menuitem"
                  >
                    {item.name}
                    <span className="text-gray-500">{item.command}</span>
                  </button>
                </li>
              ))}
            </ul>
          ))}
        </div>
      )}
    </AuthLayout>
  )
}

export default withAuth(HomePage)

const menuItems = {
  group_1: [
    {
      name: 'Share',
      command: '',
    },
    {
      name: 'Get link',
      command: '',
    },
    {
      name: 'Move to',
      command: 'Ctrl+M',
    },
  ],
  group_2: [
    {
      name: 'Copy link',
      command: 'Ctrl+C',
    },
  ],
  group_3: [
    {
      name: 'Rename',
      command: '',
    },
    {
      name: 'Duplicate',
      command: '',
    },
  ],
  group_4: [
    {
      name: 'Delete',
      command: 'Ctrl+D',
    },
    {
      name: 'Archieve',
      command: '',
    },
    {
      name: 'Import files',
      command: '',
    },
  ],
}
