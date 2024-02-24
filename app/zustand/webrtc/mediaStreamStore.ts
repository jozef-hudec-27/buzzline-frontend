import { create } from 'zustand'

import { MyMediaStream, SetMediaStreamFn, SetDeviceMutedFn } from '@/app/types/mediaStreamTypes'

type MediaStreamStore = {
  localMediaStream: MyMediaStream
  setLocalMediaStream: SetMediaStreamFn

  localMicMuted: boolean
  localVideoMuted: boolean
  setLocalDeviceMuted: SetDeviceMutedFn

  remoteMediaStream: MyMediaStream
  setRemoteMediaStream: SetMediaStreamFn

  remoteMicMuted: boolean
  remoteVideoMuted: boolean
  setRemoteDeviceMuted: SetDeviceMutedFn
}

export default create<MediaStreamStore>((set, get) => ({
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
