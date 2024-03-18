import { LinkUtils } from '@/utils/link-utils'
import { SupabaseTable, supabaseClient } from '@/utils/supabase-utils'
import { getCurrentUser, wait } from './api-utils'

export interface Link {
  id: string
  uuid: string
  title: string
  url: string
  user_id: string
  tags: string[]
  created_at: string
  updated_at: string
  visited_at: string
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

async function getLinks(): Promise<Link[]> {
  const user = await getCurrentUser()

  const { data, error } = await supabaseClient
    .from(SupabaseTable.Links)
    .select()
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  // TODO: Handle this
  if (error) {
    return []
  }

  await wait(1500)

  return LinkUtils.splitByPinned(data)
}

export interface UpdateLinkRequestParams extends Partial<Link> {
  uuid: string
}

async function updateLink(updates: UpdateLinkRequestParams): Promise<void> {
  const updated_at = new Date().toISOString();
  const updatedLink: Partial<Link> = { ...updates, updated_at }

  const { data, error, status } = await supabaseClient
    .from(SupabaseTable.Links)
    .update(updatedLink)
    .eq('uuid', updatedLink.uuid)
    .select()
    .single()

  if (error && status !== 406) {
    throw error
  }

  return data
}

export interface CreateLinkRequestParams {
  title: string
  url: string
}

async function createLink(params: CreateLinkRequestParams) {
  const user = await getCurrentUser()

  const created_at = new Date().toISOString();
  const updated_at = new Date().toISOString();
  const visited_at = new Date().toISOString();

  const newLink: Partial<Link> = {
    title: params.title,
    url: params.url,
    user_id: user?.id,
    tags: [],
    created_at,
    updated_at,
    visited_at,
  }

  const { data, error, status } = await supabaseClient
    .from(SupabaseTable.Links)
    .insert(newLink)
    .select()
    .single()

  if (error && status !== 406) {
    throw error
  }

  return data
}

async function batchCreateLinks(newLinks: Partial<Link>[]) {
  const { data, error, status } = await supabaseClient
    .from(SupabaseTable.Links)
    .insert(newLinks)
    .select()

  if (error && status !== 406) {
    throw error
  }

  return data
}

async function deleteLink(uuid: string) {
  const { data, error, status } = await supabaseClient
    .from(SupabaseTable.Links)
    .delete()
    .eq('uuid', uuid)

  if (error && status !== 406) {
    throw error
  }

  return data
}

export const LinksApi = {
  getLinks,
  updateLink,
  createLink,
  batchCreateLinks,
  deleteLink,
}
