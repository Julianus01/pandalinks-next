import { Link } from './AdminLinksApi'
import {
  DocumentData,
  QueryDocumentSnapshot,
  collection,
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

export const LinksApi = {
  getLinks,
  updateLink,
}
