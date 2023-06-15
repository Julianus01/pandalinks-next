import db from '@/utils/db'

async function getLinks() {
  const links = await db.collection('links').get()
  const linksData = links.docs.map((link) => ({
    id: link.id,
    ...link.data(),
  }))

  return linksData
}

const LinksApi = {
  getLinks,
}

export default LinksApi
