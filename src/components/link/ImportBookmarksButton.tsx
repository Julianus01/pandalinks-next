import { Dialog } from '@headlessui/react'
import React, { ChangeEvent, useContext, useRef, useState } from 'react'
import Image from 'next/image'
// @ts-ignore
import { bookmarksToJSON } from 'bookmarks-to-json'
import { Bookmark, Link, LinksApi } from '@/api/LinksApi'
import { LinkUtils } from '@/utils/link-utils'
import { toast } from 'sonner'
import { ReactQueryKey } from '@/api/ReactQueryKey'
import fp from 'lodash/fp'
import { SupabaseAuthContext } from '@/context/SupabaseAuthContext'
import { useMutation, useQueryClient } from '@tanstack/react-query'

function ImportBookmarksButton() {
  const queryClient = useQueryClient()
  const { user } = useContext(SupabaseAuthContext)
  const importInputRef = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState<boolean>(false)

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
            title: bookmark.title,
            url: bookmark.url,
            user_id: user?.id,
            tags: bookmark.tags || [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            visited_at: new Date().toISOString(),
          })),
          LinkUtils.getBookmarksFromImportedJson,
          (content: string) => JSON.parse(content)
        )(stringContent)

        if (newLinks.length === 0) {
          toast.error('Invalid Bookmarks html file')

          event.target.value = ''
          return
        }

        const createPromise = batchCreateLinksMutation.mutateAsync(newLinks, {
          onSuccess: (responseLinks) => {
            queryClient.setQueryData([ReactQueryKey.getLinks, user?.id], (data) => {
              const oldLinks = data as Link[]

              const updatedLinks: Link[] = [...(responseLinks as Link[]), ...oldLinks] as Link[]

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
    <>
      <div className="relative">
        <button onClick={() => importInputRef.current?.click()} className="btn-default">
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

      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <Dialog.Panel>
          <Dialog.Title>Deactivate account</Dialog.Title>
          <Dialog.Description>This will permanently deactivate your account</Dialog.Description>

          <p>
            Are you sure you want to deactivate your account? All of your data will be permanently removed. This action
            cannot be undone.
          </p>

          <button onClick={() => setIsOpen(false)}>Deactivate</button>
          <button onClick={() => setIsOpen(false)}>Cancel</button>
        </Dialog.Panel>
      </Dialog>
    </>
  )
}

export default ImportBookmarksButton
