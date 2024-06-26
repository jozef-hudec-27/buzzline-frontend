import { Message } from './globalTypes'

export type MessagesResponse = {
  docs: Message[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}

type SetMessagesUpdaterFn = (prevMessages: Message[]) => Message[]

export type SetMessagesFn = (updater: SetMessagesUpdaterFn | Message[]) => void

export type AddMessageFn = (message: Message) => void

export type RemoveMessageFn = (messageId: string) => void

export type AddRemovedMessageFn = (messageId: string) => void

export type FetchMessagesFn = (chatId: string, page?: number, initial?: boolean) => Promise<MessagesResponse>

export type MessageToRemove = Message | null

export type SetMessageToRemoveFn = (message: MessageToRemove) => void
