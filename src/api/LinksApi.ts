import { Link } from './AdminLinksApi'
import {
  DocumentData,
  QueryDocumentSnapshot,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { FirestoreCollection } from './FirestoreCollection'
import { getAuth } from 'firebase/auth'
import { LinkUtils } from '@/utils/link-utils'
import fp from 'lodash/fp'

const auth = getAuth()
const firestore = getFirestore()

async function getLinks(): Promise<Link[]> {
  const querySnapshot = await getDocs(
    query(
      collection(firestore, FirestoreCollection.links),
      where('userId', '==', auth.currentUser?.uid),
      orderBy('visitedAt', 'desc')
    )
  )

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

  return links
}

export interface UpdateLinkRequestParams extends Partial<Link> {
  id: string
}

async function updateLink({ id, ...updates }: UpdateLinkRequestParams): Promise<void> {
  const updatedAt = Date.now()

  const updatedLink: Partial<Link> = { ...updates, updatedAt }

  return setDoc(doc(firestore, FirestoreCollection.links, id), updatedLink, { merge: true })
}

export interface CreateLinkRequestParams {
  url: string
}

async function createLink(params: CreateLinkRequestParams) {
  const createdAt = Date.now()
  const updatedAt = Date.now()
  const visitedAt = Date.now()

  const newLink: Partial<Link> = {
    url: params.url,
    userId: auth.currentUser?.uid,
    tags: [],
    createdAt,
    updatedAt,
    visitedAt,
  }

  const newLinkDoc = await addDoc(collection(firestore, FirestoreCollection.links), newLink)

  return { ...newLink, id: newLinkDoc.id }
}

async function batchCreateLinks(links: Partial<Link>[]) {
  const batch = writeBatch(firestore)

  links.forEach((link) => {
    const docRef = doc(firestore, FirestoreCollection.links, link.id as string)

    batch.set(docRef, link)
  })

  return batch.commit()
}

async function deleteLink(linkId: string) {
  return deleteDoc(doc(firestore, FirestoreCollection.links, linkId))
}

export const LinksApi = {
  getLinks,
  updateLink,
  createLink,
  batchCreateLinks,
  deleteLink,
}
