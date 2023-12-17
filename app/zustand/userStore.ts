import { create } from 'zustand'
import api from '../api/axiosInstance'

import { User } from '@/app/types'

type UserStore = {
  user: User
  setUser: (user: User) => void
  isLoading: boolean
  fetchUser: () => any
  isLoggedIn: boolean
}

export default create<UserStore>()((set) => ({
  user: {} as User,
  setUser: (user) => set({ user, isLoggedIn: !!Object.keys(user).length }),
  isLoading: true,
  fetchUser: async () => {
    if (!localStorage.getItem('accessToken')) {
      set({ isLoading: false })
      return
    }

    set({ isLoading: true })

    try {
      const response = await api(true).get('/api/me')
      set({ user: response.data, isLoading: false, isLoggedIn: !!Object.keys(response.data).length })
    } catch (err: unknown) {
      set({ isLoading: false })
    }
  },
  isLoggedIn: false,
}))
