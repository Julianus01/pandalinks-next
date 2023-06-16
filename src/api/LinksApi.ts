import { Link } from './AdminLinksApi'
import {
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  query,
  setDoc,
} from 'firebase/firestore'
import { FirestoreCollection } from './FirestoreCollection'

async function getLinks(): Promise<Link[]> {
  const querySnapshot = await getDocs(query(collection(getFirestore(), FirestoreCollection.links)))

  const links = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
    id: doc.id,
    ...doc.data(),
  })) as Link[]

  return links
}

export interface UpdateLinkRequestParams extends Partial<Link> {
  id: string
}

async function updateLink({ id, ...updates }: UpdateLinkRequestParams): Promise<void> {
  return setDoc(doc(getFirestore(), FirestoreCollection.links, id), updates, { merge: true })
}

export interface CreateLinkRequestParams {
  src: string
}

async function createLink(params: CreateLinkRequestParams) {
  // TODO: Fix this
  const createdAt = Timestamp.now()
  const updatedAt = Timestamp.now()

  const newLink: Partial<Link> = {
    src: params.src,
    // createdAt,
    // updatedAt,
  }

  const newEnvironmentDoc = await addDoc(collection(getFirestore(), FirestoreCollection.links), newLink)

  return { ...newLink, id: newEnvironmentDoc.id }
}

// Delete Project Environments
async function deleteLink(linkId: string) {
  return deleteDoc(doc(getFirestore(), FirestoreCollection.links, linkId))
}

export const LinksApi = {
  getLinks,
  updateLink,
  createLink,
  deleteLink,
}
