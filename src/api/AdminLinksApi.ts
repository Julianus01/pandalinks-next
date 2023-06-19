import { FirestoreCollection } from './FirestoreCollection'
import { Timestamp } from 'firebase/firestore'
import firebaseAdmin from '@/utils/firebaseAdmin'
import { LinkUtils } from '@/utils/link-utils'

const db = firebaseAdmin.firestore()

export interface Link {
  id: string
  url: string
  userId: string
  tags: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
  visitedAt: Timestamp
}

async function getLinks(userId: string): Promise<Link[]> {
  const links = await db
    .collection(FirestoreCollection.links)
    .where('userId', '==', userId)
    .orderBy('visitedAt', 'desc')
    .get()

  const linksData = links.docs.map((doc) => {
    const data = doc.data()

    return {
      id: doc.id,
      ...data,
    }
  }) as Link[]

  const splitByPinnedLinks = LinkUtils.splitByPinned(linksData)

  // Need to stringify and then parse because date object
  // is not json format and it breaks Next
  const linksResponse = JSON.parse(JSON.stringify(splitByPinnedLinks))

  return linksResponse || []
}

export const AdminLinksApi = {
  getLinks,
}
