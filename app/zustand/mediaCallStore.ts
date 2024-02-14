import { create } from 'zustand'

import { Call } from '../types'

type MediaCallStore = {
  incomingCall: Call
  setIncomingCall: (call: Call) => void

  outcomingCall: Call
  setOutcomingCall: (call: Call) => void

  currentCall: Call
  setCurrentCall: (call: Call) => void

  localMediaStream: MediaStream | null
  setLocalMediaStream: (stream: MediaStream | null) => void

  remoteMediaStream: MediaStream | null
  setRemoteMediaStream: (stream: MediaStream | null) => void
}

export default create<MediaCallStore>((set, get) => ({
  incomingCall: null,
  setIncomingCall: (call) => set({ incomingCall: call }),

  outcomingCall: null,
  setOutcomingCall: (call) => set({ outcomingCall: call }),

  currentCall: null,
  setCurrentCall: (call) => {
    if (call) {
      set({ currentCall: call, outcomingCall: null, incomingCall: null })
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

  remoteMediaStream: null,
  setRemoteMediaStream: (stream) => {
    if (!stream) {
      get()
        .remoteMediaStream?.getTracks()
        .forEach((track) => track.stop())
    }

    set({ remoteMediaStream: stream })
  },
}))
