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

function Navbar() {
  const queryClient = useQueryClient()
  const importInputRef = useRef<HTMLInputElement>(null)
  const { user } = useContext(AuthContext)

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
          fp.map((bookmark: Bookmark) => ({
            // TODO: Add also title here
            // Generate id to use it for batch write
            id: uuidv4(),
            url: bookmark.url,
            userId: user?.uid,
            tags: bookmark.tags || [],
            createdAt: bookmark.addDate,
            updatedAt: Date.now(),
            visitedAt: Date.now(),
          })),
          LinkUtils.getBookmarksFromImportedJson,
          (content: string) => JSON.parse(content)
        )(stringContent)

        const createPromise = batchCreateLinksMutation.mutateAsync(newLinks, {
          onSuccess: () => {
            queryClient.setQueryData([ReactQueryKey.getLinks, user?.uid], (data) => {
              const oldLinks = data as Link[]

              const updatedLinks: Link[] = [...newLinks, ...oldLinks] as Link[]

              return LinkUtils.applyPinAndSortByVisitedAt(updatedLinks)
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
      <div className="w-full max-w-2xl h-20 pt-6 flex items-center px-5">
        <Image priority src="/logo-side-text-md.svg" width={162.8} height={30} alt="logo" />

        <div className="flex items-center space-x-2 ml-auto">
          <div className="relative">
            <button
              onClick={() => importInputRef.current?.click()}
              className="block bg-white px-4 py-2 mt-3 text-center text-gray-700 duration-150 font-medium rounded-lg border hover:bg-gray-50 active:bg-gray-100 sm:mt-0 md:text-sm"
            >
              Import Bookmarks
            </button>

            <input
              ref={importInputRef}
              className="absolute top-0 right-0 bottom-0 left-0 hidden"
              onChange={onImportBookmarks}
              type="file"
            />
          </div>

          <button
            onClick={logout}
            className="block bg-white px-4 py-2 mt-3 text-center text-gray-700 duration-150 font-medium rounded-lg border hover:bg-gray-50 active:bg-gray-100 sm:mt-0 md:text-sm"
          >
            logout
          </button>

          {user?.photoURL && (
            <div className="relative inline-block">
              <Image
                width={38}
                height={38}
                className="inline-block rounded-full ring-2 ring-white"
                src={`${user.photoURL}`}
                alt="avatar"
              />

              <span className="absolute bottom-0 right-0 inline-block w-3 h-3 bg-green-600 border-2 border-white rounded-full"></span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Navbar
