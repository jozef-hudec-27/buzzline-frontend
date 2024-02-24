import { create } from 'zustand'
import api from '../api/axiosInstance'

import { ChatShow } from '../types/globalTypes'
import { SetChatFn, FetchChatFn } from '../types/currentChatTypes'

type CurrentChatStore = {
  chat: ChatShow
  setChat: SetChatFn
  isLoading: boolean
  fetchChat: FetchChatFn
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
