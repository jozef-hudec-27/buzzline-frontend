import { MediaConnection } from 'peerjs'

// Fields of register form
export type RegisterFormState = {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

// Fields of login form
export type LoginFormState = {
  email: string
  password: string
}

// User (global)
export type User = {
  email: string
  firstName: string
  lastName: string
  chatToken: string
  avatarUrl: string
  _id: string
}

// Chat message
export type Message = {
  _id: string
  chat: string
  sender: User
  content: string
  voiceClipUrl?: string
  imageUrl?: string
  isRemoved?: boolean
  readBy: string[]
  createdAt: string
}

// Newest message in chat (shown in left panel)
export type NewestMessage = {
  _id: string
  content: string
  voiceClipUrl?: string
  imageUrl?: string
  isRemoved?: boolean
  createdAt: string
  readBy: string[]
  sender: string
}

// Chat (index page)
export type ChatIndex = {
  _id: string
  isGroup: boolean
  users: User[]
  newestMessage?: NewestMessage
}

// Chat (show/detail page)
export type ChatShow = {
  _id: string
  isGroup: boolean
  users: User[]
  newestMessage?: NewestMessage
}

// Media call
export type Call = MediaConnection | null

export type MediaStreamTrack = 'audio' | 'video'

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
