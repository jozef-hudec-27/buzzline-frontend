import { create } from 'zustand'

import { Call } from '../types'
import { MutableRefObject } from 'react'

type MediaCallStore = {
  incomingCall: Call
  setIncomingCall: (call: Call) => void
  incomingCallRef: MutableRefObject<Call>

  outcomingCall: Call
  setOutcomingCall: (call: Call) => void
  outcomingCallRef: MutableRefObject<Call>

  currentCall: Call
  setCurrentCall: (call: Call) => void
  currentCallRef: MutableRefObject<Call>

  localMediaStream: MediaStream | null
  setLocalMediaStream: (stream: MediaStream | null) => void

  localMicMuted: boolean
  localVideoMuted: boolean
  setLocalDeviceMuted: (device: 'audio' | 'video', muted: boolean) => void

  remoteMediaStream: MediaStream | null
  setRemoteMediaStream: (stream: MediaStream | null) => void

  remoteMicMuted: boolean
  remoteVideoMuted: boolean
  setRemoteDeviceMuted: (device: 'audio' | 'video', muted: boolean) => void
}

export default create<MediaCallStore>((set, get) => ({
  incomingCall: null,
  setIncomingCall: (call) => {
    set({ incomingCall: call })
    get().incomingCallRef.current = call
  },
  incomingCallRef: { current: null },

  outcomingCall: null,
  setOutcomingCall: (call) => {
    set({ outcomingCall: call })
    get().outcomingCallRef.current = call
  },
  outcomingCallRef: { current: null },

  currentCall: null,
  setCurrentCall: (call) => {
    get().currentCallRef.current = call

    if (call) {
      set({ currentCall: call })
      get().setIncomingCall(null)
      get().setOutcomingCall(null)
    } else {
      set({ currentCall: call })
    }
  },
  currentCallRef: { current: null },

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

  localMicMuted: false,
  localVideoMuted: false,
  setLocalDeviceMuted: (device, muted) => {
    set(device === 'audio' ? { localMicMuted: muted } : { localVideoMuted: muted })
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

  remoteMicMuted: false,
  remoteVideoMuted: false,
  setRemoteDeviceMuted: (device, muted) => {
    set(device === 'audio' ? { remoteMicMuted: muted } : { remoteVideoMuted: muted })
  },
}))
