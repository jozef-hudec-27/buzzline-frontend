import { create } from 'zustand'
import api from '../api/axiosInstance'

import { ChatIndex } from '../types/globalTypes'
import { SetChatsFn, FetchChatsFn } from '../types/chatsTypes'

type ChatsStore = {
  chats: ChatIndex[]
  setChats: SetChatsFn
  isLoading: boolean
  hasFetched: boolean
  fetchChats: FetchChatsFn
}

export default create<ChatsStore>()((set) => ({
  chats: [],
  setChats: (updater: (prevChats: ChatIndex[]) => ChatIndex[]) => set((prev) => ({ chats: updater(prev.chats) })),
  isLoading: true,
  hasFetched: false,
  fetchChats: async () => {
    set({ isLoading: true })

    try {
      const response = await api(true).get('/api/chats')
      set({ chats: response.data, isLoading: false, hasFetched: true })
    } catch (err: unknown) {
      set({ isLoading: false })
    }
  },
}))
