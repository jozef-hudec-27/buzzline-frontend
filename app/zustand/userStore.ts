import { create } from 'zustand'
import api from '../api/axiosInstance'

type UserStore = {
  user: Object
  setUser: (user: Object) => void
  isLoading: boolean
  fetchUser: () => any
  isLoggedIn: boolean
}

export default create<UserStore>()((set) => ({
  user: {},
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
      console.log('##ZUSTAND ERROR', err)

      set({ isLoading: false })
    }
  },
  isLoggedIn: false,
}))
