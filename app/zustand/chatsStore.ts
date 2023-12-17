import { create } from 'zustand'
import api from '../api/axiosInstance'

import { ChatIndex } from '@/app/types'

type ChatsStore = {
  chats: ChatIndex[]
  setChats: (chats: ChatIndex[]) => void
  isLoading: boolean
  fetchChats: () => any
}

export default create<ChatsStore>()((set) => ({
  chats: [],
  setChats: (chats) => set({ chats }),
  isLoading: true,
  fetchChats: async () => {
    set({ isLoading: true })

    try {
      const response = await api(true).get('/api/chats')
      set({ chats: response.data, isLoading: false })
    } catch (err: unknown) {
      set({ isLoading: false })
    }
  },
}))
