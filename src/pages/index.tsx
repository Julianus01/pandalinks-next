import { AdminLinksApi, Link } from '@/api/AdminLinksApi'
import { LinksApi } from '@/api/LinksApi'
import { ReactQueryKey } from '@/api/ReactQueryKey'
import AuthLayout from '@/components/AuthLayout'
import { withAuth } from '@/firebase/withAuth'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'

export async function getServerSideProps() {
  const response = await AdminLinksApi.getLinks()

  return { props: { links: response } }
}

interface Props {
  links: Link[]
}

function HomePage(props: Props) {
  const linksQuery = useQuery({
    queryKey: [ReactQueryKey.getLinks],
    queryFn: LinksApi.getLinks,
    initialData: props.links,
  })

  return (
    <AuthLayout>
      <div className="w-full max-w-3xl h-16 px-5 mx-auto pt-20">
        <div className="flex space-x-2 mb-6">
          <div className="relative flex-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6 text-gray-400 absolute left-3 inset-y-0 my-auto"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>

            <input
              type="text"
              placeholder="Search your links..."
              className="w-full pl-12 pr-3 py-2 text-gray-700 bg-white outline-none border focus:border-gray-400 shadow-sm rounded-lg"
            />
          </div>

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
            add link
          </button>
        </div>

        <div className="flex-y-2">
          {linksQuery.data.map((link: Link) => (
            <a
              rel="noopener noreferrer"
              target="_blank"
              href={`//${link.src}`}
              key={link.id}
              className="px-4 py-2 hover:bg-gray-100 rounded cursor-pointer -mx-1 flex items-center"
            >
              <Image
                className="mr-2"
                alt="test"
                width={18}
                height={18}
                src={`https://www.google.com/s2/favicons?domain=${link.src}&sz=256`}
              />

              <p>{link.src}</p>
            </a>
          ))}
        </div>
      </div>
    </AuthLayout>
  )
}

export default withAuth(HomePage)
