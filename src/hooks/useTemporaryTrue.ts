import { useState } from 'react'

export function useTemporaryTrue(time = 2000): [boolean, () => void] {
  const [value, setValue] = useState<boolean>(false)

  function triggerTemporaryTrue() {
    setValue(true)

    setTimeout(() => {
      setValue(value)
    }, time)
  }

  return [value, triggerTemporaryTrue]
}
