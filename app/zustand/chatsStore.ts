import { create } from 'zustand'
import api from '../api/axiosInstance'

import { User as TUser } from './userStore'

export type Chat = {
  _id: string
  users: TUser[]
  newestMessage?: { content: string }
}

type ChatsStore = {
  chats: Chat[]
  setChats: (chats: Chat[]) => void
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
