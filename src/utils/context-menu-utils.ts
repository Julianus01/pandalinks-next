import { Link } from '@/api/AdminLinksApi'

export enum ContextMenuAction {
  visit = 'visit',
  pin = 'pin',
  unpin = 'unpin',
  copyLink = 'copyLink',
  edit = 'edit',
  delete = 'delete',
}

export interface ContextMenuRow {
  action: ContextMenuAction
  name: string
  command?: string
  hide?: boolean
}

const getContextMenuGroupOne = (link: Link): ContextMenuRow[] => {
  const isPinned = link.tags.includes('pinned')

  const groupOne: ContextMenuRow[] = [
    {
      action: ContextMenuAction.visit,
      name: 'Visit',
      command: 'Cmd + O',
    },
    {
      action: ContextMenuAction.copyLink,
      name: 'Copy link',
      command: 'Cmd + C',
    },
    {
      action: ContextMenuAction.pin,
      name: 'Pin',
      hide: isPinned,
      command: 'Cmd + P',
    },
    {
      action: ContextMenuAction.unpin,
      name: 'Unpin',
      hide: !isPinned,
      command: 'Cmd + P',
    },
    {
      action: ContextMenuAction.edit,
      name: 'Edit',
      command: 'Enter',
    },
  ]

  return groupOne.filter((item) => !item.hide)
}

const getContextMenuGroupTwo = (): ContextMenuRow[] => [
  {
    action: ContextMenuAction.delete,
    name: 'Delete',
    command: 'Cmd + Delete',
  },
]

export const ContentMenuUtils = {
  getContextMenuGroupOne,
  getContextMenuGroupTwo,
}
