import { AdminLinksApi, Link } from '@/api/AdminLinksApi'
import { CreateLinkRequestParams, LinksApi, UpdateLinkRequestParams } from '@/api/LinksApi'
import { ReactQueryKey } from '@/api/ReactQueryKey'
import AuthLayout from '@/components/shared/AuthLayout'
import LinkRow from '@/components/Links/LinkRow'
import SearchAndCreateLinksInput from '@/components/Links/SearchAndCreateLinksInput'
import { withAuth } from '@/firebase/withAuth'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useContext, useMemo, useRef, useState } from 'react'
import { useClickAway, useKey } from 'react-use'
import { toast } from 'sonner'
import LinkRowAdd from '@/components/Links/LinkRowAdd'
import LoadingPage from '@/components/shared/LoadingPage'
import Navbar from '@/components/shared/Navbar'
import { AuthContext } from '@/context/AuthContext'
import nookies from 'nookies'
import { GetServerSidePropsContext } from 'next'
import firebaseAdmin from '@/utils/firebaseAdmin'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  try {
    const cookies = nookies.get(ctx)
    const token = await firebaseAdmin.auth().verifyIdToken(cookies.token)

    const links = await AdminLinksApi.getLinks(token.uid)

    return {
      props: { links },
    }
  } catch (err) {
    // either the `token` cookie didn't exist
    // or token verification failed
    // either way: redirect to the login page
    ctx.res.writeHead(302, { Location: '/login' })
    ctx.res.end()

    // `as never` prevents inference issues
    // with InferGetServerSidePropsType.
    // The props returned here don't matter because we've
    // already redirected the user.
    return { props: { links: [] } as never }
  }
}

interface Props {
  links: Link[]
}

function HomePage(props: Props) {
  const queryClient = useQueryClient()
  const { user } = useContext(AuthContext)
  const [showAddRow, setShowAddRow] = useState<boolean>(false)
  const [searchQ, setSearchQ] = useState<string>('')
  const [selected, setSelected] = useState<string | null>(null)
  const [editLink, setEditLink] = useState<string | null>(null)
  const linksContainerRef = useRef(null)

  const contextMenuRef = useRef<HTMLDivElement>(null)
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const linksQuery = useQuery({
    queryKey: [ReactQueryKey.getLinks, user?.uid],
    queryFn: LinksApi.getLinks,
    initialData: props.links,
  })

  const links = useMemo(() => {
    return linksQuery.data || []
  }, [linksQuery.data])

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
    resetContextMenu()
    setSelected(null)
    setEditLink(null)
  })

  useKey(
    'Enter',
    () => {
      if (selected && !editLink) {
        setEditLink(selected)
      }
    },
    {},
    [selected, editLink]
  )

  // Delete Key
  useKey(
    (event) => {
      return (event.ctrlKey || event.metaKey) && (event.keyCode === 46 || event.key === 'Backspace')
    },
    () => {
      if (selected) {
        onDeleteLink(selected)
      }
    },
    {},
    [selected]
  )

  useClickAway(linksContainerRef, () => {
    setSelected(null)
  })

  function onDeleteLink(linkId: string) {
    queryClient.setQueryData([ReactQueryKey.getLinks, user?.uid], (data) => {
      const oldLinks = data as Link[]

      return oldLinks.filter((oldLink) => oldLink.id !== selected)
    })

    if (selected) {
      const index = filteredLinks.map((link) => link.id).indexOf(selected)

      if (filteredLinks[index + 1]) {
        setSelected(filteredLinks[index + 1].id)
        setEditLink(null)
      } else if (filteredLinks[index - 1]) {
        setSelected(filteredLinks[index - 1].id)
        setEditLink(null)
      }
    } else {
      setSelected(null)
      setEditLink(null)
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

  function onUpdateLink(updatedLink: UpdateLinkRequestParams) {
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
          queryClient.setQueryData([ReactQueryKey.getLinks, user?.uid], (data) => {
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
      return links
    }

    return links.filter((link) => link.src.toLowerCase().includes(searchQ.toLowerCase()))
  }, [links, searchQ])

  function handleContextMenu(e: React.MouseEvent<HTMLDivElement>, link: Link) {
    setSelected(link.id)
    e.preventDefault()
    const { pageX, pageY } = e
    setShowContextMenu(true)
    setTimeout(() => {
      if (contextMenuRef?.current) {
        const rect = contextMenuRef.current.getBoundingClientRect()
        const x =
          pageX - scrollX + rect.width > window.innerWidth ? window.innerWidth - rect.width : pageX - scrollX + 2

        const y =
          pageY - scrollY + rect.height > window.innerHeight ? window.innerHeight - rect.height : pageY - scrollY + 2
        setPosition({ x, y })
        contextMenuRef?.current?.classList.remove('opacity-0')
        document.documentElement.classList.add('overflow-hidden')
      }
    }, 100)
  }

  function onContextMenuRowClick(contextMenuRow: ContextMenuRow) {
    const link = filteredLinks.find((link) => link.id === selected)

    if (!link) {
      resetContextMenu()
      return
    }

    switch (contextMenuRow.action) {
      case ContextMenuAction.copyLink:
        navigator.clipboard.writeText(link.src)
        toast(
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75"
              />
            </svg>
            Copied to clipboard{' '}
          </>
        )
        break

      case ContextMenuAction.edit:
        setEditLink(selected)
        break

      case ContextMenuAction.delete:
        if (selected) {
          onDeleteLink(selected)
        }
        break
    }

    resetContextMenu()
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

  if (linksQuery.isLoading) {
    return <LoadingPage />
  }

  return (
    <AuthLayout
      header={
        <div className="fixed left-0 top-0 right-0 backdrop-blur-sm z-10">
          <Navbar />

          <div className="w-full max-w-2xl px-5 mx-auto pt-20 space-y-4">
            <div className="flex space-x-2">
              <SearchAndCreateLinksInput
                isCreateMode={!linksQuery.isLoading && !filteredLinks?.length}
                onCreate={onCreateLink}
                value={searchQ}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearchQ(event.target.value)}
              />

              {!linksQuery.isLoading && !!filteredLinks?.length && (
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
              )}
            </div>
          </div>
        </div>
      }
    >
      <div className="w-full max-w-2xl px-5 mx-auto py-20">
        <div ref={linksContainerRef} className="space-y-2 pt-36">
          {!linksQuery.isLoading && !filteredLinks.length && (
            <div className="inline mt-2">
              Press{' '}
              <kbd className="px-2 py-1.5 text-xs text-gray-800 bg-white border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                Enter
              </kbd>{' '}
              to add the link
            </div>
          )}

          {!!filteredLinks.length && (
            <div className="px-2 pb-2 flex items-center border-b">
              <p className="text-sm text-gray-500">Destination</p>

              <p className="ml-auto text-sm text-gray-500">last visited</p>
            </div>
          )}

          {showAddRow && <LinkRowAdd onClose={() => setShowAddRow(false)} onCreate={onCreateLink} />}

          {filteredLinks.map((link: Link) => {
            const isSelected = selected === link.id

            return (
              <LinkRow
                onUpdate={onUpdateLink}
                onExitEditMode={() => setEditLink(null)}
                isEditMode={editLink === link.id}
                onContextMenu={(event) => handleContextMenu(event, link)}
                link={link}
                key={link.id}
                onClick={() => {
                  setSelected(link.id)
                }}
                onDoubleClick={() => navigateToLink(link)}
                isSelected={isSelected}
              />
            )
          })}

          {showContextMenu && (
            <div
              ref={contextMenuRef}
              className="fixed z-10 opacity-0 max-w-[17rem] w-full rounded-lg bg-white shadow-md border text-sm text-gray-800"
              style={{ top: `${position.y}px`, left: `${position.x}px` }}
            >
              {[CONTEXT_MENU_GROUP_ONE, CONTEXT_MENU_GROUP_TWO].map((group, i) => (
                <ul className="px-2 py-1.5 border-t" role="menu" key={i}>
                  {group.map((contextMenuRow, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => onContextMenuRowClick(contextMenuRow)}
                        className="w-full flex items-center justify-between gap-x-2 px-2 py-1.5  hover:bg-gray-50 active:bg-gray-100 rounded-lg group cursor-pointer"
                        role="menuitem"
                      >
                        {' '}
                        {contextMenuRow.name}
                        <span className="text-gray-500">{contextMenuRow.command}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  )
}

export default withAuth(HomePage)

enum ContextMenuAction {
  copyLink = 'copyLink',
  edit = 'edit',
  delete = 'delete',
}

interface ContextMenuRow {
  action: ContextMenuAction
  name: string
  command: string
}

const CONTEXT_MENU_GROUP_ONE: ContextMenuRow[] = [
  {
    action: ContextMenuAction.copyLink,
    name: 'Copy link',
    command: 'Cmd + C',
  },
  {
    action: ContextMenuAction.edit,
    name: 'Edit',
    command: 'Enter',
  },
]

const CONTEXT_MENU_GROUP_TWO: ContextMenuRow[] = [
  {
    action: ContextMenuAction.delete,
    name: 'Delete',
    command: 'Cmd + Delete',
  },
]
