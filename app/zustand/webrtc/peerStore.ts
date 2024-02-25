import { create } from 'zustand'

import { MyPeer, InitPeerFn, KillPeerFn } from '@/app/types/peerTypes'

type PeerStore = {
  peer: MyPeer
  initPeer: InitPeerFn
  killPeer: KillPeerFn
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
  killPeer: () => {
    const peer = get().peer
    if (peer) {
      peer.destroy()
      set({ peer: null })
    }
  },
}))
