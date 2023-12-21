import { Socket } from 'socket.io-client'
import { create } from 'zustand'

type SocketStore = {
  socket: Socket | null
  setSocket: (socket: Socket) => void
}

export default create<SocketStore>((set) => ({
  socket: null,
  setSocket: (socket) => set({ socket }),
}))
