import { create } from 'zustand'
import api from '../api/axiosInstance'

import { Message } from '@/app/types'

type MessagesResponse = {
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
  setMessages: (updater: (prevMessages: Message[]) => Message[]) => void
  addMessage: (message: Message) => void
  isLoading: boolean
  initialLoading: boolean
  fetchMessages: (chatId: string, page?: number, initial?: boolean) => Promise<MessagesResponse>
}

export default create<CurrentChatMessagesStore>()((set) => ({
  messages: [],
  setMessages: (updater: (prevMessages: Message[]) => Message[]) =>
    set((prev) => ({ messages: updater(prev.messages) })),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
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
