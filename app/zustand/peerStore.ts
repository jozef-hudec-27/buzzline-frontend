import { Peer } from 'peerjs'
import { create } from 'zustand'

type PeerStore = {
  peer: Peer | null
  setPeer: (peer: Peer) => void
}

export default create<PeerStore>((set) => ({
  peer: null,
  setPeer: (peer) => set({ peer }),
}))
