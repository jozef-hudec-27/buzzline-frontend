import { create } from 'zustand'

import api from '../api/axiosInstance'
import { createSetter } from './zustandUtils'

import { ChatShow } from '../types/globalTypes'
import { SetChatFn, FetchChatFn, SetMessageFn } from '../types/currentChatTypes'
import { MutableRefObject } from 'react'

type CurrentChatStore = {
  chat: ChatShow
  setChat: SetChatFn
  isLoading: boolean
  fetchChat: FetchChatFn
  message: string
  messageRef: MutableRefObject<string>
  setMessage: SetMessageFn
}

export default create<CurrentChatStore>()((set, get) => ({
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
  message: '',
  messageRef: { current: '' },
  setMessage: createSetter<string, CurrentChatStore>('message', set, () => (get().messageRef.current = get().message)),
}))
