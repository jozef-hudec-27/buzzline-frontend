import { Peer } from 'peerjs'
import { create } from 'zustand'

type PeerStore = {
  peer: Peer | null
  setPeer: (peer: Peer) => void

  currentCall: MediaStream | null
  setCurrentCall: (call: MediaStream | null) => void
}

export default create<PeerStore>((set) => ({
  peer: null,
  setPeer: (peer) => set({ peer }),

  currentCall: null,
  setCurrentCall: (call) => set({ currentCall: call }),
}))
