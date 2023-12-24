import { create } from 'zustand'
import api from '../api/axiosInstance'

import { ChatIndex } from '@/app/types'

type ChatsStore = {
  chats: ChatIndex[]
  setChats: (updater: (prevChats: ChatIndex[]) => ChatIndex[]) => void
  isLoading: boolean
  hasFetched: boolean
  fetchChats: () => any
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
