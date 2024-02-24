// User (global)
export type User = {
  email: string
  firstName: string
  lastName: string
  chatToken: string
  avatarUrl?: string
  _id: string
}

// Chat message
export type Message = {
  _id: string
  chat: string
  sender: User
  content: string
  voiceClipUrl?: string
  imageUrl?: string
  isRemoved?: boolean
  readBy: string[]
  createdAt: string
}

// Newest message in chat (shown in left panel)
export type NewestMessage = {
  _id: string
  content: string
  voiceClipUrl?: string
  imageUrl?: string
  isRemoved?: boolean
  createdAt: string
  readBy: string[]
  sender: string
}

// Chat (index page)
export type ChatIndex = {
  _id: string
  isGroup: boolean
  users: User[]
  newestMessage?: NewestMessage
}

// Chat (show/detail page)
export type ChatShow = {
  _id: string
  isGroup: boolean
  users: User[]
  newestMessage?: NewestMessage
}
