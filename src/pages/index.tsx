import { AdminLinksApi, Link } from '@/api/AdminLinksApi'
import AuthLayout from '@/components/shared/AuthLayout'
import LinkRow from '@/components/link/LinkRow'
import SearchAndCreateLinksInput from '@/components/link/SearchAndCreateLinksInput'
import { withAuth } from '@/firebase/withAuth'
import { useRef, useState } from 'react'
import { useClickAway, useKey } from 'react-use'
import { toast } from 'sonner'
import LoadingPage from '@/components/shared/LoadingPage'
import { GetServerSidePropsContext } from 'next'
import nookies from 'nookies'
import firebaseAdmin from '@/utils/firebaseAdmin'
import GlobalTagsSelector from '@/components/tags/GlobalTagsSelector'
import { useLinks } from '@/hooks/useLinks'
import { ContentMenuUtils, ContextMenuAction, ContextMenuRow } from '@/utils/context-menu-utils'

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
  const linksContainerRef = useRef(null)

  const contextMenuRef = useRef<HTMLDivElement>(null)
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const useLinksHooks = useLinks({ initialData: props.links })

  // Close context menu when clicking away
  useClickAway(contextMenuRef, resetContextMenu)

  useKey(
    'Escape',
    () => {
      resetContextMenu()

      if (useLinksHooks.editLinkId) {
        useLinksHooks.actions.setSelectionParams({ editLinkId: null })
        return
      }

      useLinksHooks.actions.setSelectionParams({ selectedId: null })
    },
    {},
    [useLinksHooks.editLinkId]
  )

  useKey(
    'ArrowUp',
    (event) => {
      event.preventDefault()

      if (useLinksHooks.editLinkId) {
        return
      }

      if (!useLinksHooks.selectedId) {
        useLinksHooks.actions.setSelectionParams({ selectedId: useLinksHooks.links[0].id })
      }

      const currentIndex = useLinksHooks.links.findIndex((link) => link.id === useLinksHooks.selectedId)

      if (useLinksHooks.links[currentIndex - 1]) {
        useLinksHooks.actions.setSelectionParams({ selectedId: useLinksHooks.links[currentIndex - 1].id })
      }
    },
    {},
    [useLinksHooks.selectedId, useLinksHooks.editLinkId]
  )

  useKey(
    'ArrowDown',
    (event) => {
      event.preventDefault()

      if (useLinksHooks.editLinkId) {
        return
      }

      if (!useLinksHooks.selectedId) {
        useLinksHooks.actions.setSelectionParams({ selectedId: useLinksHooks.links[0].id })
      }

      const currentIndex = useLinksHooks.links.findIndex((link) => link.id === useLinksHooks.selectedId)

      if (useLinksHooks.links[currentIndex + 1]) {
        useLinksHooks.actions.setSelectionParams({ selectedId: useLinksHooks.links[currentIndex + 1].id })
      }
    },
    {},
    [useLinksHooks.selectedId, useLinksHooks.editLinkId, useLinksHooks.links]
  )

  useKey(
    'Enter',
    () => {
      if (useLinksHooks.selectedId && !useLinksHooks.editLinkId) {
        useLinksHooks.actions.setSelectionParams({ editLinkId: useLinksHooks.selectedId })
      }
    },
    {},
    [useLinksHooks.selectedId, useLinksHooks.editLinkId]
  )

  useKey(
    (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'o') {
        event.preventDefault()
        return true
      }

      return false
    },
    () => {
      if (useLinksHooks.selectedLink) {
        navigateToLink(useLinksHooks.selectedLink)
      }
    },
    {},
    [useLinksHooks.selectedId]
  )

  useKey(
    (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
        event.preventDefault()
        return true
      }

      return false
    },
    () => {
      if (useLinksHooks.selectedLink) {
        const isPinned = useLinksHooks.selectedLink?.tags?.includes('pinned')

        if (!isPinned) {
          useLinksHooks.actions.pinLink(useLinksHooks.selectedLink.id)
        } else {
          useLinksHooks.actions.unpinLink(useLinksHooks.selectedLink.id)
        }
      }
    },
    {},
    [useLinksHooks.selectedLink]
  )

  useKey(
    (event) => {
      return (event.ctrlKey || event.metaKey) && (event.keyCode === 46 || event.key === 'Backspace')
    },
    () => {
      if (useLinksHooks.selectedId) {
        useLinksHooks.actions.deleteLink(useLinksHooks.selectedId)
      }
    },
    {},
    [useLinksHooks.selectedId]
  )

  useClickAway(linksContainerRef, () => {
    useLinksHooks.actions.setSelectionParams({ selectedId: null })
  })

  function handleContextMenu(e: React.MouseEvent<HTMLDivElement>, link: Link) {
    useLinksHooks.actions.setSelectionParams({ selectedId: link.id })
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
    const link = useLinksHooks.links.find((link) => link.id === useLinksHooks.selectedId)

    if (!link) {
      resetContextMenu()
      return
    }

    switch (contextMenuRow.action) {
      case ContextMenuAction.visit: {
        if (useLinksHooks.selectedLink) {
          navigateToLink(useLinksHooks.selectedLink)
        }

        break
      }

      case ContextMenuAction.copyLink: {
        navigator.clipboard.writeText(link.url)
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
      }

      case ContextMenuAction.pin: {
        if (useLinksHooks.selectedId) {
          useLinksHooks.actions.pinLink(useLinksHooks.selectedId)
        }

        break
      }

      case ContextMenuAction.unpin: {
        if (useLinksHooks.selectedId) {
          useLinksHooks.actions.unpinLink(useLinksHooks.selectedId)
        }

        break
      }

      // TODO: This scrolls the page to top in Safari
      case ContextMenuAction.edit: {
        useLinksHooks.actions.setSelectionParams({
          selectedId: useLinksHooks.selectedId,
          editLinkId: useLinksHooks.selectedId,
        })

        break
      }

      case ContextMenuAction.delete: {
        if (useLinksHooks.selectedId) {
          useLinksHooks.actions.deleteLink(useLinksHooks.selectedId)
        }

        break
      }
    }

    resetContextMenu()
  }

  function resetContextMenu() {
    setShowContextMenu(false)
    document.documentElement.classList.remove('overflow-hidden')
  }

  function navigateToLink(link: Link) {
    const updatedLink: Link = { ...link, visitedAt: Date.now() }
    useLinksHooks.mutations.updateLinkMutation.mutate(updatedLink)

    if (!link.url.match(/^https?:\/\//i)) {
      return window.open(`http://${link.url}`, '_blank')
    }

    return window.open(link.url, '_blank')
  }

  if (useLinksHooks.isLoading) {
    return <LoadingPage />
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-3xl mx-auto pt-20 space-y-6 px-5 pb-40">
        <SearchAndCreateLinksInput
          isCreateMode={!useLinksHooks.isLoading && !useLinksHooks.links?.length}
          onCreate={useLinksHooks.actions.createLink}
          value={useLinksHooks.searchQ}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            useLinksHooks.actions.setSearchQ(event.target.value)
          }
        />

        <GlobalTagsSelector
          tags={useLinksHooks.allTags}
          selectedTags={useLinksHooks.selectedTags}
          onChange={useLinksHooks.actions.setSelectedTags}
        />

        <div ref={linksContainerRef} className="space-y-2">
          {!useLinksHooks.isLoading && !useLinksHooks.links.length && (
            <div className="inline mt-2">
              Press{' '}
              <kbd className="px-2 py-1.5 text-xs text-gray-800 bg-white border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                Enter
              </kbd>{' '}
              to add the link
            </div>
          )}

          {!!useLinksHooks.links.length && (
            <div className="px-2 pb-2 flex items-center border-b">
              <p className="text-sm text-gray-500">{useLinksHooks.links?.length} Results - Destination</p>

              <div className="ml-auto flex items-center space-x-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-4 h-4 text-gray-500"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25L12 21m0 0l-3.75-3.75M12 21V3" />
                </svg>

                <p className="text-sm text-gray-500">created at</p>
              </div>
            </div>
          )}

          {useLinksHooks.links.map((link: Link) => {
            const isSelected = useLinksHooks.selectedId === link.id

            return (
              <LinkRow
                onUpdate={useLinksHooks.actions.updateLink}
                onExitEditMode={() => {
                  useLinksHooks.actions.setSelectionParams({ editLinkId: null })
                }}
                isEditMode={useLinksHooks.editLinkId === link.id}
                onContextMenu={(event) => handleContextMenu(event, link)}
                link={link}
                key={link.id}
                onClick={() => {
                  useLinksHooks.actions.setSelectionParams({ selectedId: link.id })
                }}
                onDoubleClick={() => navigateToLink(link)}
                isSelected={isSelected}
              />
            )
          })}

          {showContextMenu && useLinksHooks.selectedLink && (
            <div
              ref={contextMenuRef}
              className="fixed z-10 opacity-0 max-w-[17rem] w-full rounded-lg bg-white shadow-md border text-sm text-gray-800"
              style={{ top: `${position.y}px`, left: `${position.x}px` }}
            >
              {[
                ContentMenuUtils.getContextMenuGroupOne(useLinksHooks.selectedLink),
                ContentMenuUtils.getContextMenuGroupTwo(),
              ].map((group, i) => (
                <ul className="px-2 py-2 border-t" role="menu" key={i}>
                  {group.map((contextMenuRow, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => onContextMenuRowClick(contextMenuRow)}
                        className="w-full flex items-center gap-x-2 px-2 py-2 hover:bg-gray-50 active:bg-gray-100 rounded-lg group cursor-default"
                        role="menuitem"
                      >
                        {contextMenuRow.icon && contextMenuRow.icon} {contextMenuRow.name}
                        <span className="text-gray-500 ml-auto">{contextMenuRow.command}</span>
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
