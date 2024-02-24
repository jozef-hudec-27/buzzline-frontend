import { create } from 'zustand'

import { MySocket, SetSocketFn, SocketRef, SetSocketDisconnectedFn } from '../types/socketTypes'

type SocketStore = {
  socket: MySocket
  setSocket: SetSocketFn
  socketRef: SocketRef

  socketDisconnected: boolean
  setSocketDisconnected: SetSocketDisconnectedFn
}

export default create<SocketStore>((set, get) => ({
  socket: null,
  setSocket: (socket) => {
    set({ socket })
    get().socketRef.current = socket
  },
  socketRef: { current: null },

  socketDisconnected: false,
  setSocketDisconnected: (disconnected) => set({ socketDisconnected: disconnected }),
}))
