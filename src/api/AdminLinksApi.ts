import db from '@/utils/db'
import { Timestamp } from 'firebase/firestore'
import { FirestoreCollection } from './FirestoreCollection'
import { getAuth } from 'firebase/auth'

export interface Link {
  id: string
  src: string
  userId: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

async function getLinks(): Promise<Link[]> {
  const auth = getAuth()

  const links = await db.collection(FirestoreCollection.links).where('userId', '==', auth.currentUser?.uid).get()
  const linksData = links.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Link[]

  return linksData || []
}

export const AdminLinksApi = {
  getLinks,
}
