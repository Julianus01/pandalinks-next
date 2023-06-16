import db from '@/utils/db'
import { Timestamp } from 'firebase/firestore'

export interface Link {
  id: string
  src: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

async function getLinks(): Promise<Link[]> {
  const links = await db.collection('links').get()
  const linksData = links.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Link[]

  return linksData || []
}

export const AdminLinksApi = {
  getLinks,
}
