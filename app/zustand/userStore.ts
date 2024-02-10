import { create } from 'zustand'
import api from '../api/axiosInstance'

import { User } from '@/app/types'

type UserStore = {
  user: User
  setUser: (user: User) => void
  isLoading: boolean
  fetchUser: () => Promise<User>
  isLoggedIn: boolean
}

export default create<UserStore>()((set) => ({
  user: {} as User,
  setUser: (user) => set({ user, isLoggedIn: !!Object.keys(user).length }),
  isLoading: true,
  fetchUser: async () => {
    if (!localStorage.getItem('accessToken')) {
      set({ isLoading: false })
      throw new Error()
    }

    set({ isLoading: true })

    try {
      const response = await api(true).get('/api/me')
      set({ user: response.data, isLoading: false, isLoggedIn: !!Object.keys(response.data).length })

      return response.data as User
    } catch (err: unknown) {
      set({ isLoading: false })
      throw err
    }
  },
  isLoggedIn: false,
}))
