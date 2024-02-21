import { closeOutcomingCall, handleIncomingCall } from './mediaCallUtils'

import { Peer } from 'peerjs'
import { Socket } from 'socket.io-client'
import { MutableRefObject } from 'react'
import { Call, MediaStreamTrack } from '../types'

type ConfigurePeerParams = {
  peer: Peer
  userId: string
  socketRef: MutableRefObject<Socket | null>
  currentCallRef: MutableRefObject<Call | null>
  setCurrentCall: (call: Call) => void
  setLocalMediaStream: (stream: MediaStream | null) => void
  setRemoteMediaStream: (stream: MediaStream | null) => void
  incomingCallRef: MutableRefObject<Call | null>
  setIncomingCall: (call: Call) => void
  outcomingCallRef: MutableRefObject<Call | null>
  setOutcomingCall: (call: Call) => void
}

export function configurePeer(params: ConfigurePeerParams) {
  const {
    peer,
    userId,
    socketRef,
    currentCallRef,
    setCurrentCall,
    setLocalMediaStream,
    setRemoteMediaStream,
    incomingCallRef,
    setIncomingCall,
    outcomingCallRef,
    setOutcomingCall,
  } = params

  peer.on('disconnected', () => {
    if (!outcomingCallRef.current) return
    closeOutcomingCall({
      paramsType: 'ref',
      userId: userId,
      socketRef,
      outcomingCallRef,
      setOutcomingCall,
      setLocalMediaStream,
    })
  })

  peer.on('open', () =>
    handleIncomingCall(
      peer,
      socketRef,
      currentCallRef,
      setCurrentCall,
      setLocalMediaStream,
      setRemoteMediaStream,
      incomingCallRef,
      setIncomingCall,
      outcomingCallRef
    )
  )
}

type ConfigurePeerConnectionParams = {
  pc: RTCPeerConnection
  socket: Socket | null
  from: string
  to: string
  setRemoteDeviceMuted: (kind: MediaStreamTrack, muted: boolean) => void
}

export function configurePeerConnection(params: ConfigurePeerConnectionParams) {
  const { pc, socket, from, to, setRemoteDeviceMuted } = params

  if (!pc) return

  pc.addEventListener('negotiationneeded', async () => {
    // @ts-ignore
    if (window.callUpgrade) {
      // @ts-ignore
      window.callUpgrade = false

      // Upgrading the call from audio to video
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      socket?.emit('notification', {
        type: 'NOTI_OFFER',
        from,
        to,
        offer,
      })
    }
  })

  pc.addEventListener('track', (event) => {
    const newTrack = event.track
    // Show/hide remote peer's avatar
    setRemoteDeviceMuted(newTrack.kind as MediaStreamTrack, !newTrack.enabled)
  })
}
