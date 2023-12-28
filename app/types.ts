// Fields of register form
export type RegisterFormState = {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

// Fields of login form
export type LoginFormState = {
  email: string
  password: string
}

// User object
export type User = {
  email: string
  firstName: string
  lastName: string
  chatToken: string
  avatarUrl: string
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
  readBy: string[]
  createdAt: string
}

export type NewestMessage = {
  _id: string
  content: string
  createdAt: string
  readBy: string[]
  sender: string
}

export type ChatIndex = {
  _id: string
  isGroup: boolean
  users: User[]
  newestMessage?: NewestMessage
}

export type ChatShow = {
  _id: string
  isGroup: boolean
  users: User[]
  newestMessage?: NewestMessage
}
