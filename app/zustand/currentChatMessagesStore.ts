import { create } from 'zustand'
import api from '../api/axiosInstance'

import { Message } from '@/app/types'

type CurrentChatMessagesStore = {
  messages: Message[]
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  isLoading: boolean
  fetchMessages: (chatId: string) => any
}

export default create<CurrentChatMessagesStore>()((set) => ({
  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  isLoading: false,
  fetchMessages: async (chatId) => {
    set({ isLoading: true })

    try {
      const response = await api(true).get(`/api/chats/${chatId}/messages`)
      set({ messages: response.data, isLoading: false })
    } catch (err: unknown) {
      set({ isLoading: false })
    }
  },
}))
