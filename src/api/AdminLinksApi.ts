import { FirestoreCollection } from './FirestoreCollection'
import { DocumentData, QueryDocumentSnapshot, Timestamp } from 'firebase/firestore'
import firebaseAdmin from '@/utils/firebaseAdmin'
import { LinkUtils } from '@/utils/link-utils'
import fp from 'lodash/fp'

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
  const querySnapshot = await db
    .collection(FirestoreCollection.links)
    .where('userId', '==', userId)
    .orderBy('visitedAt', 'desc')
    .get()

  const links = fp.compose(
    // Need to stringify and then parse because date object
    // is not json format and it breaks Next
    (links) => JSON.parse(JSON.stringify(links)),

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
