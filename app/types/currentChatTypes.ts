import { ChatShow } from './globalTypes'

export type SetChatFn = (chat: ChatShow) => void

export type FetchChatFn = (chatId: string) => any

export type SetMessageUpdaterFn = (prevMessage: string) => string

export type SetMessageFn = (updater: SetMessageUpdaterFn | string) => void
