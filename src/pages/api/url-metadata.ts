import { NextApiRequest, NextApiResponse } from 'next'
import ogs, { SuccessResult } from 'open-graph-scraper'

function promiseRejectInTime(time = 1000): any {
  return new Promise((resolve) => setTimeout(() => resolve({ error: true }), time))
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const url = req.query.url as string | undefined

    if (!url) {
      return res.status(500).send({ message: 'URL not specified in the request' })
    }

    const metadata = await Promise.race<SuccessResult>([ogs({ url: url }), promiseRejectInTime()])

    if (metadata.error) {
      return res.status(500).send({ message: 'Cannot get information, error occured' })
    }

    res.status(200).json(metadata.result)
  } catch (error: any) {
    return res.status(500).send({ message: error.message })
  }
}
