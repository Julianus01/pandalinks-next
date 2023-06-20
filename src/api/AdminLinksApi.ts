import { FirestoreCollection } from './FirestoreCollection'
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'
import firebaseAdmin from '@/utils/firebaseAdmin'
import { LinkUtils } from '@/utils/link-utils'
import fp from 'lodash/fp'

const db = firebaseAdmin.firestore()

export interface Link {
  id: string
  url: string
  userId: string
  tags: string[]
  createdAt: number
  updatedAt: number
  visitedAt: number
}

async function getLinks(userId: string): Promise<Link[]> {
  const querySnapshot = await db
    .collection(FirestoreCollection.links)
    .where('userId', '==', userId)
    .orderBy('visitedAt', 'desc')
    .get()

  const links = fp.compose(
    LinkUtils.splitByPinned,

    fp.map((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data()

      return {
        id: doc.id,
        ...data,
      }
    })
  )(querySnapshot.docs)

  return links || []
}

export const AdminLinksApi = {
  getLinks,
}
