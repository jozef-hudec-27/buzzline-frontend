import { create } from 'zustand'

import { MyPeer, InitPeerFn } from '@/app/types/peerTypes'

type PeerStore = {
  peer: MyPeer
  initPeer: InitPeerFn
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

    window.addEventListener('beforeunload', (e) => {
      if (!peer.destroyed) peer.destroy()
    })

    return peer
  },
}))
