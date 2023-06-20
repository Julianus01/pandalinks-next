import { NextApiRequest, NextApiResponse } from 'next'
import urlMetadata from 'url-metadata'

function dummyPromise(time = 2000) {
  return new Promise((resolve) => setTimeout(() => resolve({ code: 'error' }), time))
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const url = req.query.url as string | undefined

    if (!url) {
      return res.status(500).send({ message: 'URL not specified in the request' })
    }

    const metadata: any = await Promise.race([urlMetadata(url), dummyPromise(2000)])

    if (metadata?.code === 'error') {
      return res.status(500).send({ message: 'Cannot get information' })
    }

    res.status(200).json(metadata)
  } catch (error: any) {
    return res.status(500).send({ message: error.message })
  }
}
