import NavbarLogoOnly from '../link/NavbarLogoOnly'

export default function LoadingPage() {
  return (
    <>
      <NavbarLogoOnly />
      <div className="flex flex-col w-full animate-pulse max-w-3xl px-5 mx-auto pt-20">
        <div className="flex items-center w-full space-x-2">
          <div className="h-10 bg-gray-200 dark:bg-slate-800 rounded w-full" />

          <div className="h-10 bg-gray-200 dark:bg-slate-800 rounded w-11" />
        </div>

        <div className="w-full mx-auto py-6 space-y-4">
          <div className="flex items-end">
            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-20" />

            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-16 ml-auto" />
          </div>

          <div className="w-full border-b-0 border border-solid dark:border-slate-700" />

          <div className="flex items-end">
            <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded w-48" />

            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-20 ml-auto" />
          </div>

          <div className="flex items-center">
            <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded w-64" />

            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-20 ml-auto" />
          </div>

          <div className="flex items-center">
            <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded w-80" />

            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-20 ml-auto" />
          </div>

          <div className="flex items-center">
            <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded w-64" />

            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-20 ml-auto" />
          </div>
        </div>
      </div>
    </>
  )
}
