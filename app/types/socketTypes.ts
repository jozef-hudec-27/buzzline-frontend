import { Socket } from 'socket.io-client'
import { MutableRefObject } from 'react'
import { Message } from './globalTypes'
import { MediaStreamTrack } from './mediaStreamTypes'

export type MySocket = Socket | null

export type SetSocketFn = (socket: Socket) => void

export type SocketRef = MutableRefObject<MySocket>

export type SetSocketDisconnectedFn = (disconnected: boolean) => void

// DM Types
type DMType =
  | 'DM_MSG_NOTI'
  | 'DM_CALLEE_IN_CALL'
  | 'DM_INCOMING_CALL_CLOSE'
  | 'DM_OUTCOMING_CALL_DECLINE'
  | 'DM_DEVICE_MUTE_TOGGLE'
  | 'DM_SDP_OFFER'
  | 'DM_SDP_ANSWER'

export type DMData = {
  type: DMType
  from: string
  to: string
}

export type DMMsgNoti = {
  type: 'DM_MSG_NOTI'
  message: Message
}

export type DMCalleeInCall = {
  type: 'DM_CALLEE_IN_CALL'
}

export type DMIncomingCallClose = {
  type: 'DM_INCOMING_CALL_CLOSE'
}

export type DMOutcomingCallDecline = {
  type: 'DM_OUTCOMING_CALL_DECLINE'
}

export type DMDeviceMuteToggle = {
  type: 'DM_DEVICE_MUTE_TOGGLE'
  device: {
    kind: MediaStreamTrack
    enabled: boolean
  }
}

export type DMSDPOffer = {
  type: 'DM_SDP_OFFER'
  offer: RTCSessionDescriptionInit
}

export type DMSDPAnswer = {
  type: 'DM_SDP_ANSWER'
  answer: RTCSessionDescriptionInit
}
