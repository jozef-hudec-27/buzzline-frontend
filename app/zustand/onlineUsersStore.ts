import { create } from 'zustand'

import { UserList, AddOnlineUserFn, RemoveOnlineUserFn, IsUserOnlineFn } from '../types/onlineUsersTypes'

type OnlineUsersStore = {
  users: UserList
  addUser: AddOnlineUserFn
  removeUser: RemoveOnlineUserFn
  isOnline: IsUserOnlineFn
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
