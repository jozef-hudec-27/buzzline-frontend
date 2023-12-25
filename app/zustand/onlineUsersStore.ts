import { create } from 'zustand'

type OnlineUsersStore = {
  users: Set<string>
  addUser: (userId: string) => void
  removeUser: (userId: string) => void
  isOnline: (userId: string) => boolean
}

export default create<OnlineUsersStore>((set, get) => ({
  users: new Set(),
  addUser: (userId) => set((state) => ({ users: new Set(state.users).add(userId) })),
  removeUser: (userId) =>
    set((state) => {
      const newUsers = new Set(state.users)
      newUsers.delete(userId)
      return { users: newUsers }
    }),
  isOnline: (userId) => {
    return get().users.has(userId)
  },
}))
