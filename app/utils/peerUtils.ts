import { closeOutcomingCall, handleIncomingCall } from './mediaCallUtils'

import { Peer } from 'peerjs'
import { Socket } from 'socket.io-client'
import { MutableRefObject } from 'react'
import { Call } from '../types'

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
