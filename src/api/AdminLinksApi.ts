import { FirestoreCollection } from './FirestoreCollection'
import { Timestamp } from 'firebase/firestore'
import firebaseAdmin from '@/utils/firebaseAdmin'

const db = firebaseAdmin.firestore()

export interface Link {
  id: string
  url: string
  userId: string
  createdAt: Timestamp
  updatedAt: Timestamp
  visitedAt: Timestamp
}

async function getLinks(userId: string): Promise<Link[]> {
  const links = await db
    .collection(FirestoreCollection.links)
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get()

  const linksData = links.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Link[]

  // Need to stringify and then parse because date object
  // is not json format and it breaks Next
  const linksResponse = JSON.parse(JSON.stringify(linksData))

  return linksResponse || []
}

export const AdminLinksApi = {
  getLinks,
}
