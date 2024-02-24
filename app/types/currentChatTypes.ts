import { ChatShow } from './globalTypes'

export type SetChatFn = (chat: ChatShow) => void

export type FetchChatFn = (chatId: string) => any
