import React, { ChangeEvent, useContext, useRef } from 'react'
import Image from 'next/image'
import { logout } from '@/firebase/auth'
import { AuthContext } from '@/context/AuthContext'
// @ts-ignore
import { bookmarksToJSON } from 'bookmarks-to-json'
import { Bookmark, Link } from '@/api/AdminLinksApi'
import { LinkUtils } from '@/utils/link-utils'
import { LinksApi } from '@/api/LinksApi'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ReactQueryKey } from '@/api/ReactQueryKey'
import fp from 'lodash/fp'
import { v4 as uuidv4 } from 'uuid'
import { useTheme } from 'next-themes'

function Navbar() {
  const queryClient = useQueryClient()
  const importInputRef = useRef<HTMLInputElement>(null)
  const { user } = useContext(AuthContext)

  const { theme, setTheme } = useTheme()

  const batchCreateLinksMutation = useMutation({
    mutationFn: (newLinks: Partial<Link>[]) => LinksApi.batchCreateLinks(newLinks),
  })

  function onImportBookmarks(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target?.files?.[0]

    if (file) {
      const fileReader = new FileReader()
      fileReader.readAsText(file)
      fileReader.onload = () => {
        const stringContent = bookmarksToJSON(fileReader.result, {
          formatJSON: true, // return prettified JSON - false by default
          spaces: 2, // number of spaces to use for indentation - 2 by default
        })

        const newLinks = fp.compose(
          LinkUtils.applyPinAndSortByCreatedAt,
          fp.map((bookmark: Bookmark) => ({
            // Generate id to use it for batch write
            id: uuidv4(),
            title: bookmark.title,
            url: bookmark.url,
            userId: user?.uid,
            tags: bookmark.tags || [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            visitedAt: Date.now(),
          })),
          LinkUtils.getBookmarksFromImportedJson,
          (content: string) => JSON.parse(content)
        )(stringContent)

        if (newLinks.length === 0) {
          toast.error('Invalid Bookmarks html file')

          event.target.value = ''
          return
        }

        // TODO: Remove slice
        const createPromise = batchCreateLinksMutation.mutateAsync(newLinks, {
          onSuccess: () => {
            queryClient.setQueryData([ReactQueryKey.getLinks, user?.uid], (data) => {
              const oldLinks = data as Link[]

              const updatedLinks: Link[] = [...newLinks, ...oldLinks] as Link[]

              return LinkUtils.applyPinAndSortByCreatedAt(updatedLinks)
            })

            event.target.value = ''
          },
        })

        toast.promise(createPromise, {
          loading: 'Importing bookmarks...',
          success: () => {
            return `Imported Bookmarks`
          },
          error: 'Something went wrong',
        })
      }
    }
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl h-20 pt-6 flex items-center px-5">
        <Image className="dark:invert" priority src="/logo-side-text-md.svg" width={162.8} height={30} alt="logo" />

        <div className="flex items-center space-x-2 ml-auto">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center justify-center bg-white px-2.5 py-2 mt-3 text-center text-gray-700 duration-150 font-medium rounded-lg border hover:bg-gray-50 active:bg-gray-100 sm:mt-0 md:text-sm dark:text-white dark:bg-gray-800 dark:border-gray-800 dark:hover:bg-gray-700 dark:hover:border-gray-700"
          >
            {theme === 'light' ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => importInputRef.current?.click()}
              className="flex items-center bg-white px-4 py-2 mt-3 text-center text-gray-700 duration-150 font-medium rounded-lg border hover:bg-gray-50 active:bg-gray-100 sm:mt-0 md:text-sm dark:text-white dark:bg-gray-800 dark:border-gray-800 dark:hover:bg-gray-700 dark:hover:border-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5 mr-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
                />
              </svg>
              Import Bookmarks
            </button>

            <input
              ref={importInputRef}
              className="absolute top-0 right-0 bottom-0 left-0 hidden"
              onChange={onImportBookmarks}
              type="file"
              accept=".html"
            />
          </div>

          <button
            onClick={logout}
            className="block bg-white px-4 py-2 mt-3 text-center text-gray-700 duration-150 font-medium rounded-lg border hover:bg-gray-50 active:bg-gray-100 sm:mt-0 md:text-sm dark:text-white dark:bg-gray-800 dark:border-gray-800 dark:hover:bg-gray-700 dark:hover:border-gray-700"
          >
            logout
          </button>

          {user?.photoURL && (
            <div className="relative inline-block">
              <Image
                width={38}
                height={38}
                className="inline-block rounded-full ring-2 ring-white dark:ring-gray-800"
                src={`${user.photoURL}`}
                alt="avatar"
              />

              <span className="absolute bottom-0 right-0 inline-block w-3 h-3 bg-green-600 border-2 border-white dark:border-slate-900 rounded-full"></span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Navbar
