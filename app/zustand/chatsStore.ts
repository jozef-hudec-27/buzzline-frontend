import { create } from 'zustand'
import api from '../api/axiosInstance'

import { ChatIndex } from '../types/globalTypes'
import { SetChatsFn, FetchChatsFn, UpdateChatsFn } from '../types/chatsTypes'

type ChatsStore = {
  chats: ChatIndex[]
  setChats: SetChatsFn
  isLoading: boolean
  hasFetched: boolean
  fetchChats: FetchChatsFn
  updateChats: UpdateChatsFn
}

export default create<ChatsStore>()((set, get) => ({
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
  // Used to manually update chats panel
  updateChats: (chatId, updater, action) => {
    get().setChats((prevChats) => {
      const chat = prevChats.find((c) => c._id === chatId)
      if (!chat) return prevChats

      const newChat = updater(chat)

      switch (action) {
        case 'replace':
          return prevChats.map((c) => (c._id === chatId ? newChat : c))
        case 'unshift':
          return [newChat, ...prevChats.filter((c) => c._id !== chatId)]
        default:
          return prevChats
      }
    })
  },
}))
