import { toast } from 'react-hot-toast'

import { Peer } from 'peerjs'
import { MySocket, SocketRef } from '../types/socketTypes'
import { SetCallFn, MyCall, CallRef } from '../types/mediaCallTypes'
import { SetMediaStreamFn, MediaStreamTrack } from '../types/mediaStreamTypes'

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

type HandleIncomingCallParams = {
  peer: Peer
  socketRef: SocketRef
  currentCallRef: CallRef
  setCurrentCall: SetCallFn
  setLocalMediaStream: SetMediaStreamFn
  setRemoteMediaStream: SetMediaStreamFn
  incomingCallRef: CallRef
  setIncomingCall: SetCallFn
  outcomingCallRef: CallRef
}

export function handleIncomingCall(params: HandleIncomingCallParams) {
  const {
    peer,
    socketRef,
    currentCallRef,
    setCurrentCall,
    setLocalMediaStream,
    setRemoteMediaStream,
    incomingCallRef,
    setIncomingCall,
    outcomingCallRef,
  } = params

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
  setOutcomingCall: SetCallFn
  setLocalMediaStream: SetMediaStreamFn
} & (
  | { paramsType: 'val'; socket: MySocket; outcomingCall: MyCall }
  | { paramsType: 'ref'; socketRef: SocketRef; outcomingCallRef: CallRef }
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

type AddTrackToPeerConnectionParams = {
  kind: MediaStreamTrack
  pc: RTCPeerConnection
  stream: MediaStream
  setLocalDeviceMuted: (kind: MediaStreamTrack, muted: boolean) => void
  finishCb?: () => void
}

export function addTrackToPeerConnection(params: AddTrackToPeerConnectionParams) {
  const { kind, pc, stream, setLocalDeviceMuted } = params

  const getNewTrack = async () => {
    const newStream = await navigator.mediaDevices.getUserMedia({ [kind]: true })
    return newStream.getTracks()[0]
  }

  getNewTrack()
    .then((track) => {
      stream.addTrack(track)
      setLocalDeviceMuted(kind, !track.enabled)

      // @ts-ignore
      window.addingTrack = true
      pc.addTrack(track, stream) // triggers the negotiationneeded event

      if (params.finishCb) params.finishCb()
    })
    .catch((e) => accessUserMediaCatchHandler(e, kind === 'video', true))
}
