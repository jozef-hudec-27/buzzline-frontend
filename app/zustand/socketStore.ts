import { Socket } from 'socket.io-client'
import { create } from 'zustand'

import { MutableRefObject } from 'react'

type SocketStore = {
  socket: Socket | null
  setSocket: (socket: Socket) => void
  socketRef: MutableRefObject<Socket | null>

  socketDisconnected: boolean
  setSocketDisconnected: (disconnected: boolean) => void
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
