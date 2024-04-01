import { create } from 'zustand'

import api from '../api/axiosInstance'
import { createSetter } from './zustandUtils'

import { Message } from '../types/globalTypes'
import {
  SetMessagesFn,
  AddMessageFn,
  RemoveMessageFn,
  FetchMessagesFn,
  MessageToRemove,
  SetMessageToRemoveFn,
} from '../types/chatMessagesTypes'

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

type CurrentChatMessagesStore = {
  messages: Message[]
  setMessages: SetMessagesFn
  addMessage: AddMessageFn
  removeMessage: RemoveMessageFn
  messageToRemove: MessageToRemove
  setMessageToRemove: SetMessageToRemoveFn
  isLoading: boolean
  initialLoading: boolean
  fetchMessages: FetchMessagesFn
}

export default create<CurrentChatMessagesStore>()((set, get) => ({
  messages: [],
  setMessages: createSetter<Message[], CurrentChatMessagesStore>('messages', set),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  removeMessage: (messageId) => {
    // set((state) => {
    //   if (!state.messages.find((message) => message._id === messageId)) {
    //     return { messages: state.messages }
    //   }

    //   const newMessages = state.messages.map((message) => {
    //     if (message._id === messageId) {
    //       return { ...message, isRemoved: true, content: '', voiceClipUrl: undefined, imageUrl: undefined }
    //     }
    //     return message
    //   })

    //   return { messages: newMessages }
    // })

    for (let i = 0; i < get().messages.length; i++) {
      const message = get().messages[i]

      if (message._id === messageId) {
        get().messages[i] = { ...message, isRemoved: true, content: '', voiceClipUrl: undefined, imageUrl: undefined }
        break
      }
    }
  },
  messageToRemove: null,
  setMessageToRemove: (message) => set({ messageToRemove: message }),
  isLoading: false,
  initialLoading: false,
  fetchMessages: async (chatId, page = 1, initial = false) => {
    const getSetObj = (val: boolean) => {
      return initial ? { initialLoading: val } : { isLoading: val }
    }
    set(getSetObj(true))

    try {
      const response = await api(true).get(`/api/chats/${chatId}/messages?page=${page}`)
      set(getSetObj(false))
      return response.data
    } catch (err: unknown) {
      set(getSetObj(false))
      throw err
    }
  },
}))
