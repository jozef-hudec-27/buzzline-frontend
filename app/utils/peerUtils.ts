import { closeOutcomingCall, handleIncomingCall } from './mediaCallUtils'

import { Peer } from 'peerjs'
import { MySocket, SocketRef } from '../types/socketTypes'
import { CallRef, SetCallFn } from '../types/mediaCallTypes'
import { SetMediaStreamFn, SetDeviceMutedFn, MediaStreamTrack } from '../types/mediaStreamTypes'
import { KillPeerFn } from '../types/peerTypes'

type ConfigurePeerParams = {
  peer: Peer
  killPeer: KillPeerFn
  userId: string
  socketRef: SocketRef
  currentCallRef: CallRef
  setCurrentCall: SetCallFn
  setLocalMediaStream: SetMediaStreamFn
  setRemoteMediaStream: SetMediaStreamFn
  incomingCallRef: CallRef
  setIncomingCall: SetCallFn
  outcomingCallRef: CallRef
  setOutcomingCall: SetCallFn
}

export function configurePeer(params: ConfigurePeerParams) {
  const {
    peer,
    killPeer,
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
    killPeer()

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

  peer.on('error', (err) => {
    if (err.type !== 'peer-unavailable') killPeer()
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
  socket: MySocket
  from: string
  to: string
  setRemoteDeviceMuted: SetDeviceMutedFn
}

export function configurePeerConnection(params: ConfigurePeerConnectionParams) {
  const { pc, socket, from, to, setRemoteDeviceMuted } = params

  if (!pc) return

  pc.addEventListener('negotiationneeded', async () => {
    // @ts-ignore
    if (window.addingTrack) {
      // @ts-ignore
      window.addingTrack = false

      // Upgrading the call from audio to video
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      socket?.emit('dm', {
        type: 'DM_SDP_OFFER',
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
