import { create } from 'zustand'

type OnlineUsersStore = {
  users: Set<string>
  addUser: (userId: string) => void
  removeUser: (userId: string) => void
  isOnline: (userId: string) => boolean
}

export default create<OnlineUsersStore>((set, get) => ({
  users: new Set(),
  addUser: (userId) => {
    get().users.add(userId)
    // Required to update state so that subscribed components rerender
    set((state) => ({ users: state.users }))
  },
  removeUser: (userId) => {
    get().users.delete(userId)
    set((state) => ({ users: state.users }))
  },
  isOnline: (userId) => {
    return get().users.has(userId)
  },
}))
