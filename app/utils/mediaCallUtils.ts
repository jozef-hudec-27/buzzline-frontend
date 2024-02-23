import { toast } from 'react-hot-toast'

import { Peer } from 'peerjs'
import { Socket } from 'socket.io-client'
import { MutableRefObject } from 'react'
import { Call } from '../types'

export function accessUserMediaCatchHandler(e: any, video = false, onlyOne = false) {
  switch (e.name) {
    case 'NotAllowedError':
      toast(
        `Please allow the ${!(video && onlyOne) ? 'microphone' : ''} ${
          video ? `${!onlyOne ? 'and' : ''} camera` : ''
        } access.`,
        { icon: '❌' }
      )
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
  socketRef: MutableRefObject<Socket | null>,
  currentCallRef: MutableRefObject<Call>,
  setCurrentCall: (call: Call) => void,
  setLocalMediaStream: (stream: MediaStream | null) => void,
  setRemoteMediaStream: (stream: MediaStream | null) => void,
  incomingCallRef: MutableRefObject<Call>,
  setIncomingCall: (call: Call) => void,
  outcomingCallRef: MutableRefObject<Call>
) {
  peer.on('call', (incomingCall) => {
    if (currentCallRef.current || outcomingCallRef.current || incomingCallRef.current) {
      socketRef.current?.emit('dm', {
        from: peer.id,
        to: incomingCall.peer,
        type: 'DM_CALLEE_IN_CALL',
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

type CloseOutcomingCallParams = {
  userId: string
  setOutcomingCall: (call: Call) => void
  setLocalMediaStream: (stream: MediaStream | null) => void
} & (
  | { paramsType: 'val'; socket: Socket | null; outcomingCall: Call }
  | { paramsType: 'ref'; socketRef: MutableRefObject<Socket | null>; outcomingCallRef: MutableRefObject<Call> }
)

export function closeOutcomingCall(params: CloseOutcomingCallParams) {
  const { paramsType, userId, setOutcomingCall, setLocalMediaStream } = params

  const s = paramsType === 'val' ? params.socket : params.socketRef.current
  const oc = paramsType === 'val' ? params.outcomingCall : params.outcomingCallRef.current

  setLocalMediaStream(null)
  s?.emit('dm', {
    from: userId,
    to: oc?.peer,
    type: 'DM_INCOMING_CALL_CLOSE',
  })
  setOutcomingCall(null)
}
