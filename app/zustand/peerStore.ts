import { Peer } from 'peerjs'
import { create } from 'zustand'

type PeerStore = {
  peer: Peer | null
  initPeer: (peerId: string) => Promise<Peer>
}

export default create<PeerStore>((set, get) => ({
  peer: null,
  initPeer: async (peerId) => {
    const currentPeer = get().peer
    if (currentPeer) {
      return currentPeer
    }

    // Importing PeerJs dynamically to avoid SSR issues
    const PeerJs = (await import('peerjs')).default
    const peer = new PeerJs(peerId)
    set({ peer })
    return peer
  },
}))
