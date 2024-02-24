import { ChatIndex } from './globalTypes'

export type SetChatsFn = (updater: (prevChats: ChatIndex[]) => ChatIndex[]) => void

export type FetchChatsFn = () => void
