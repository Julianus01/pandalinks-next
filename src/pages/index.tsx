import { AdminLinksApi, Link } from '@/api/AdminLinksApi'
import { LinksApi, UpdateLinkRequestParams } from '@/api/LinksApi'
import { ReactQueryKey } from '@/api/ReactQueryKey'
import AuthLayout from '@/components/AuthLayout'
import LinkRow from '@/components/Links/LinkRow'
import SearchLinks from '@/components/Links/SearchLinks'
import { withAuth } from '@/firebase/withAuth'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useRef, useState } from 'react'
import { useClickAway, useEvent, useKey } from 'react-use'

export async function getServerSideProps() {
  const response = await AdminLinksApi.getLinks()

  return { props: { links: response } }
}

interface Props {
  links: Link[]
}

function HomePage(props: Props) {
  const queryClient = useQueryClient()
  const [searchQ, setSearchQ] = useState<string>('')
  const [selected, setSelected] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState<boolean>(false)
  const linksContainerRef = useRef(null)

  const contextMenuRef = useRef<HTMLDivElement>(null)
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

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

  useClickAway(linksContainerRef, () => {
    setSelected(null)
  })

  const updateLinkMutation = useMutation({
    mutationFn: (updatedLink: UpdateLinkRequestParams) => LinksApi.updateLink(updatedLink),
  })

  function onUpdateLink(updatedLink: UpdateLinkRequestParams) {
    updateLinkMutation.mutate(updatedLink, {
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
  }

  const linksQuery = useQuery({
    queryKey: [ReactQueryKey.getLinks],
    queryFn: LinksApi.getLinks,
    initialData: props.links,
  })

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

  return (
    <AuthLayout>
      <div className="w-full max-w-3xl h-16 px-5 mx-auto pt-20">
        <div className="flex space-x-2 mb-6">
          <SearchLinks value={searchQ} onChange={(event) => setSearchQ(event.target.value)} />

          <button className="px-3 flex gap-1 items-center py-1.5 bg-white text-sm text-gray-700 duration-100 border rounded-lg hover:bg-gray-50 active:bg-gray-100">
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
          {filteredLinks.map((link: Link) => {
            const isSelected = selected === link.id

            return (
              <LinkRow
                isUpdating={updateLinkMutation.isPending && isSelected}
                onUpdate={onUpdateLink}
                onExitEditMode={() => setIsEditMode(false)}
                isEditMode={isEditMode && isSelected}
                onContextMenu={(event) => handleContextMenu(event, link)}
                link={link}
                key={link.id}
                onClick={() => setSelected(link.id)}
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

                  <span {...props} className="text-gray-500">
                    {item.command}
                  </span>
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
                    {' '}
                    {item.name}
                    <span {...props} className="text-gray-500">
                      {item.command}
                    </span>
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
