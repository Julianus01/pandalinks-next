interface Props {
  value: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

function SearchLinks(props: Props) {
  return (
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
        value={props.value}
        onChange={props.onChange}
        type="text"
        placeholder="Search your links..."
        className="w-full pl-12 pr-3 py-2 text-gray-700 bg-white outline-none border focus:border-gray-400 shadow-sm rounded-lg"
      />
    </div>
  )
}

export default SearchLinks
