import { Link } from './AdminLinksApi'
import { DocumentData, QueryDocumentSnapshot, collection, getDocs, getFirestore, query } from 'firebase/firestore'
import { FirestoreCollection } from './FirestoreCollection'

async function getLinks(): Promise<Link[]> {
  const querySnapshot = await getDocs(query(collection(getFirestore(), FirestoreCollection.links)))

  const links = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
    id: doc.id,
    ...doc.data(),
  })) as Link[]

  return links
}

export const LinksApi = {
  getLinks
}
