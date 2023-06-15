import { AdminLinksApi, Link } from '@/api/AdminLinksApi'
import { LinksApi } from '@/api/LinksApi'
import { ReactQueryKey } from '@/api/ReactQueryKey'
import AuthLayout from '@/components/AuthLayout'
import SearchLinks from '@/components/Links/SearchLinks'
import { withAuth } from '@/firebase/withAuth'
import { useQuery } from '@tanstack/react-query'
import classNames from 'classnames'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { useClickAway } from 'react-use'

export async function getServerSideProps() {
  const response = await AdminLinksApi.getLinks()

  return { props: { links: response } }
}

interface Props {
  links: Link[]
}

function HomePage(props: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const ref = useRef(null)

  useClickAway(ref, () => {
    setSelected(null)
  })

  const linksQuery = useQuery({
    queryKey: [ReactQueryKey.getLinks],
    queryFn: LinksApi.getLinks,
    initialData: props.links,
  })

  function onClickLink(link: Link) {
    if (selected === link.id) {
      window.open(`//${link.src}`, '_blank')

      return
    }

    setSelected(link.id)
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-3xl h-16 px-5 mx-auto pt-20">
        <div className="flex space-x-2 mb-6">
          <SearchLinks />

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

        <div ref={ref} className="space-y-1">
          {linksQuery.data.map((link: Link) => (
            <div
              onClick={() => onClickLink(link)}
              // rel="noopener noreferrer"
              // target="_blank"
              // href={`//${link.src}`}
              key={link.id}
              className={classNames({
                'px-4 py-2 hover:bg-gray-100 rounded cursor-pointer -mx-1 flex items-center': true,
                // 'bg-blue-50 hover:bg-blue-50': selected === link.id,
                'bg-gray-100 outline-1': selected === link.id,
              })}
            >
              <Image
                className="mr-2"
                alt="test"
                width={18}
                height={18}
                src={`https://www.google.com/s2/favicons?domain=${link.src}&sz=256`}
              />

              <p>{link.src}</p>
            </div>
          ))}
        </div>
      </div>
    </AuthLayout>
  )
}

export default withAuth(HomePage)
