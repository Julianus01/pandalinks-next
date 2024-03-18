import { Dialog, Transition } from '@headlessui/react'
import React, { ChangeEvent, useContext, useRef, useState } from 'react'
// @ts-ignore
import { bookmarksToJSON } from 'bookmarks-to-json'
import { Bookmark, Link, LinksApi } from '@/api/LinksApi'
import { LinkUtils } from '@/utils/link-utils'
import { toast } from 'sonner'
import { ReactQueryKey } from '@/api/ReactQueryKey'
import fp from 'lodash/fp'
import { SupabaseAuthContext } from '@/context/SupabaseAuthContext'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import SafariSvg from '../shared/SafariSvg'
import ChromeSvg from '../shared/ChromeSvg'
import BraveSvg from '../shared/BraveSvg'

function ImportBookmarksButton() {
  const queryClient = useQueryClient()
  const { user } = useContext(SupabaseAuthContext)
  const importInputRef = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

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
            setIsOpen(false)
          },
        })

        setIsLoading(true)
        toast.promise(createPromise, {
          loading: 'Importing bookmarks...',
          success: () => {
            setIsLoading(false)
            return `Imported Bookmarks`
          },
          error: () => {
            setIsLoading(false)
            return 'Something went wrong'
          },
        })
      }
    }
  }

  return (
    <>
      <div className="relative">
        <button onClick={() => setIsOpen(true)} className="btn-default outline-none">
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

      <Transition appear show={isOpen} as={React.Fragment}>
        <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={() => setIsOpen(false)}>
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-300/70 dark:bg-slate-900/75" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>

            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-slate-800 shadow-xl rounded-2xl">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-slate-300 mb-4">
                  Modal
                </Dialog.Title>

                <div className="flex items-center justify-center w-full mb-6">
                  <label
                    aria-disabled={isLoading}
                    className="flex aria-disabled:pointer-events-none flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-800 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-700 relative"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                        aria-hidden="true"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>

                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>

                      <p className="text-xs text-gray-500 dark:text-gray-400">Bookmarks HTML file</p>
                    </div>

                    <input onChange={onImportBookmarks} id="dropzone-file" type="file" className="hidden" />

                    {isLoading && (
                      <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex flex-col space-y-2 items-center justify-center bg-opacity-95">
                        <svg
                          className="animate-spin text-gray-500 dark:text-slate-300"
                          width="24"
                          height="24"
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

                        <p className="text-gray-500 dark:text-slate-400">Loading them right up</p>
                      </div>
                    )}
                  </label>
                </div>

                <p className="mb-4 text-gray-500">How do I generate HTML file for my bookmarks? 🤔</p>

                <div className="flex space-x-3">
                  <a
                    target="_blank"
                    href="https://www.youtube.com/watch?v=i1dz0q2Y71Y"
                    className="flex-1 flex flex-col cursor-pointer space-y-3 items-center rounded-lg bg-gray-100 dark:bg-slate-700 dark:hover:bg-slate-600 hover:bg-gray-200 transition-transform hover:ring-blue-200 hover:-translate-y-1 duration-150 p-4 justify-center"
                  >
                    <SafariSvg />

                    <p className="text-sm text-gray-500 dark:text-slate-300">Safari</p>
                  </a>

                  <a
                    target="_blank"
                    href="https://www.youtube.com/watch?v=tImar3ojigE?t=67s"
                    className="flex-1 flex flex-col cursor-pointer space-y-3 items-center rounded-lg bg-gray-100 dark:bg-slate-700 dark:hover:bg-slate-600 hover:bg-gray-200 transition-transform hover:ring-blue-200 hover:-translate-y-1 duration-150 p-4 justify-center"
                  >
                    <ChromeSvg />

                    <p className="text-sm text-gray-500 dark:text-slate-300">Chrome</p>
                  </a>

                  <a
                    target="_blank"
                    href="https://www.youtube.com/watch?v=tImar3ojigE?t=67s"
                    className="flex-1 flex flex-col cursor-pointer space-y-3 items-center rounded-lg bg-gray-100 dark:bg-slate-700 dark:hover:bg-slate-600 hover:bg-gray-200 transition-transform hover:ring-blue-200 hover:-translate-y-1 duration-150 p-4 justify-center"
                  >
                    <BraveSvg />

                    <p className="text-sm text-gray-500 dark:text-slate-300">Brave</p>
                  </a>
                </div>

                <div className="mt-4">
                  <button
                    disabled={isLoading}
                    type="button"
                    className="btn-default dark:bg-slate-700 dark:border-slate-700 dark:hover:bg-slate-600 dark:hover:border-slate-600 w-full outline-none py-3"
                    onClick={() => setIsOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default ImportBookmarksButton
