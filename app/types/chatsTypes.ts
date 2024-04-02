import { ChatIndex } from './globalTypes'

export type SetChatsFn = (updater: (prevChats: ChatIndex[]) => ChatIndex[]) => void

export type FetchChatsFn = () => void

export type UpdateChatsFn = (chatId: string, updater: (chat: ChatIndex) => ChatIndex, action: 'replace' | 'unshift') => void