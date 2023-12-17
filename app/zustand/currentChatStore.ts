import { create } from 'zustand'
import api from '../api/axiosInstance'

import { ChatShow } from '@/app/types'

type CurrentChatStore = {
  chat: ChatShow
  setChat: (chat: ChatShow) => void
  isLoading: boolean
  fetchChat: (chatId: string) => any
}

export default create<CurrentChatStore>()((set) => ({
  chat: {} as ChatShow,
  setChat: (chat) => set({ chat }),
  isLoading: false,
  fetchChat: async (chatId) => {
    set({ isLoading: true })

    try {
      const response = await api(true).get(`/api/chats/${chatId}`)
      set({ chat: response.data, isLoading: false })
    } catch (err: unknown) {
      set({ isLoading: false })
    }
  },
}))
