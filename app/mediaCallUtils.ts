import { toast } from 'react-hot-toast'

import { Peer } from 'peerjs'
import { Socket } from 'socket.io-client'
import { MutableRefObject } from 'react'
import { Call } from './types'

export function accessUserMediaCatchHandler(e: any, video = false) {
  switch (e.name) {
    case 'NotAllowedError':
      toast(`Please allow the microphone ${video ? 'and camera' : ''} access.`, { icon: '❌' })
      break
    case 'NotReadableError': // Media already in use
      toast('Could not access microphone or camera.', { icon: '❌' })
      break
    default:
      toast('An error occurred.', { icon: '❌' })
  }
}

export function handleIncomingCall(
  peer: Peer,
  socketStef: MutableRefObject<Socket | null>,
  currentCallStef: MutableRefObject<Call>,
  setCurrentCall: (call: Call) => void,
  setLocalMediaStream: (stream: MediaStream | null) => void,
  setRemoteMediaStream: (stream: MediaStream | null) => void,
  setIncomingCall: (call: Call) => void
) {
  peer.on('call', (incomingCall) => {
    if (currentCallStef.current) {
      socketStef.current?.emit('notification', {
        to: incomingCall.peer,
        type: 'NOTI_CALLEE_IN_CALL',
      })
    } else {
      incomingCall.on('close', () => {
        setCurrentCall(null)
        setLocalMediaStream(null)
        setRemoteMediaStream(null)
      })

      incomingCall.on('stream', (remoteStream) => {
        setRemoteMediaStream(remoteStream)
      })

      setIncomingCall(incomingCall)
    }
  })
}
