import { FirestoreCollection } from './FirestoreCollection'
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'
import firebaseAdmin from '@/utils/firebaseAdmin'
import { LinkUtils } from '@/utils/link-utils'
import fp from 'lodash/fp'

const db = firebaseAdmin.firestore()

export interface Link {
  id: string
  title: string
  url: string
  userId: string
  tags: string[]
  createdAt: number
  updatedAt: number
  visitedAt: number
}

export interface Bookmark {
  type: string
  tags: string[]
  addDate: number
  title: string
  icon: string
  url: string
}

export interface HTMLBookmark {
  type: string
  addDate: number
  title: string
  icon: string
  url: string
  children: HTMLBookmark[]
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
