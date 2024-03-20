import NavbarLogoOnly from '../link/NavbarLogoOnly'

export default function LoadingPage() {
  return (
    <>
      <NavbarLogoOnly />

      <div className="flex flex-col w-full animate-pulse max-w-3xl px-5 mx-auto pt-20 space-y-6">
        <div className="flex items-center w-full space-x-2">
          <div className="h-10 bg-gray-200 dark:bg-slate-800 rounded w-full" />

          <div className="h-10 bg-gray-200 dark:bg-slate-800 rounded w-11" />
        </div>

        <div className="w-full mx-auto space-y-4 pt-2">
          <div className="flex space-x-2">
            <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded w-20" />

            <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded w-16" />

            <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded w-10" />

            <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded w-24" />
          </div>

          <div className="flex pt-3">
            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-20" />

            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-16 ml-auto" />
          </div>

          <div className="flex flex-col space-y-0.5">
            <div className="h-12 bg-gray-200 dark:bg-slate-800 rounded" />
            <div className="h-12 bg-gray-200 dark:bg-slate-800 rounded" />
            <div className="h-12 bg-gray-200 dark:bg-slate-800 rounded" />
            <div className="h-16 bg-gray-200 dark:bg-slate-800 rounded" />
            <div className="h-12 bg-gray-200 dark:bg-slate-800 rounded" />
            <div className="h-20 bg-gray-200 dark:bg-slate-800 rounded" />
          </div>
        </div>
      </div>
    </>
  )
}
