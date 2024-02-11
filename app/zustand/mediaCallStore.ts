import { MediaConnection } from 'peerjs'
import { create } from 'zustand'

type Call = MediaConnection | null

type MediaCallStore = {
  incomingCall: Call
  setIncomingCall: (call: Call) => void

  outComingCall: Call
  setOutcomingCall: (call: Call) => void

  currentCall: Call
  setCurrentCall: (call: Call) => void

  localMediaStream: MediaStream | null
  setLocalMediaStream: (stream: MediaStream | null) => void
}

export default create<MediaCallStore>((set, get) => ({
  incomingCall: null,
  setIncomingCall: (call) => set({ incomingCall: call }),

  outComingCall: null,
  setOutcomingCall: (call) => set({ outComingCall: call }),

  currentCall: null,
  setCurrentCall: (call) => {
    if (call) {
      set({ currentCall: call, outComingCall: null, incomingCall: null })
    } else {
      set({ currentCall: call })
    }
  },

  localMediaStream: null,
  setLocalMediaStream: (stream) => {
    // Stop tracks when setting stream to null
    if (!stream) {
      get()
        .localMediaStream?.getTracks()
        .forEach((track) => track.stop())
    }

    set({ localMediaStream: stream })
  },
}))
