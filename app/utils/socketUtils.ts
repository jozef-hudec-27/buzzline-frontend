import { toast } from 'react-hot-toast'

import {
  User,
  Message,
  NewestMessage,
  ChatShow,
  ChatIndex,
  DMData,
  DMMsgNoti,
  DMCalleeInCall,
  DMIncomingCallClose,
  DMOutcomingCallDecline,
  DMSDPOffer,
  DMDeviceMuteToggle,
  DMSDPAnswer,
  Call,
} from '../types'
import { SetDeviceMutedFn } from '../zustand/webrtc/mediaStreamStore'
import { Socket } from 'socket.io-client'
import { Dispatch, SetStateAction } from 'react'

type SocketOnMessageParams = {
  scket: Socket
  user: User
  chat: ChatShow
  addMessage: (message: Message) => void
}

export function socketOnMessage(params: SocketOnMessageParams) {
  const { scket, user, chat, addMessage } = params

  scket.on('message', (data: Message) => {
    addMessage(data)

    if (data.sender._id === user._id) {
      // Send notification to all participants
      chat?.users?.concat([user]).forEach((participant) => {
        scket.emit('dm', {
          from: chat._id,
          to: participant._id,
          type: 'DM_MSG_NOTI',
          message: data,
        })
      })
    }
  })
}

type SocketOnTypingParams = {
  scket: Socket
  user: User
  setTypingUsers: Dispatch<SetStateAction<string[]>>
  typingUsers: string[]
}

export function socketOnTyping(params: SocketOnTypingParams) {
  const { scket, user, setTypingUsers, typingUsers } = params

  scket.on('typing', (data: { userId: string; isTyping: boolean }) => {
    const { userId, isTyping } = data

    if (userId === user._id) return

    if (isTyping && !typingUsers.includes(userId)) {
      setTypingUsers((prevTypingUsers) => [...prevTypingUsers, userId])
    } else if (!isTyping) {
      setTypingUsers((prevTypingUsers) => prevTypingUsers.filter((id) => id !== userId))
    }
  })
}

type SocketOnMessageRemoveParams = {
  scket: Socket
  removeMessage: (messageId: string) => void
  addRemovedMessage: (messageId: string) => void
}

export function socketOnMessageRemove(params: SocketOnMessageRemoveParams) {
  const { scket, removeMessage, addRemovedMessage } = params

  scket.on('messageRemove', (data: { messageId: string }) => {
    removeMessage(data.messageId) // Remove from Zustand store
    addRemovedMessage(data.messageId) // Make sure message component rerenders
  })
}

export function socketOnError({ scket }: { scket: Socket }) {
  scket.on('error', (data: string) => {
    toast(data, { icon: '❌' })
  })
}

type SocketOnDMParams = {
  scket: Socket
  user: User
  chat: ChatShow
  setChats: (updater: (prevChats: ChatIndex[]) => ChatIndex[]) => void
  setLocalMediaStream: (stream: MediaStream | null) => void
  setRemoteDeviceMuted: SetDeviceMutedFn
  currentCall: Call
  incomingCall: Call
  setIncomingCall: (call: Call) => void
  outcomingCall: Call
  setOutcomingCall: (call: Call) => void
}

export function socketOnDM(params: SocketOnDMParams) {
  const {
    scket,
    user,
    chat,
    setChats,
    setLocalMediaStream,
    setOutcomingCall,
    setIncomingCall,
    setRemoteDeviceMuted,
    currentCall,
    incomingCall,
    outcomingCall,
  } = params

  scket.on(
    'dm',
    async (
      data: DMData &
        (
          | DMMsgNoti
          | DMCalleeInCall
          | DMIncomingCallClose
          | DMOutcomingCallDecline
          | DMDeviceMuteToggle
          | DMSDPOffer
          | DMSDPAnswer
        )
    ) => {
      switch (data.type) {
        case 'DM_MSG_NOTI':
          if (data.message?.sender?._id !== user._id && data.from !== chat?._id) {
            const notiAudio = document.getElementById('noti-audio') as HTMLAudioElement
            notiAudio?.play().catch(function () {})
          }

          // Update chats panel
          setChats((prevChats) => {
            let chat = prevChats.find((chat) => chat._id === data.from)
            if (!chat) return prevChats

            const newestMessage: NewestMessage = { ...data.message, sender: data.message.sender._id }
            chat = { ...chat, newestMessage }
            const updatedChats = [chat, ...prevChats.filter((chat) => chat._id !== data.from)]
            return updatedChats
          })
          break
        case 'DM_CALLEE_IN_CALL': // Calling someone who is already in a different call
          toast('User is in another call', { icon: '🤙' })
          setLocalMediaStream(null)
          setOutcomingCall(null)
          break
        case 'DM_INCOMING_CALL_CLOSE': // Caller closed their call
          if (incomingCall && incomingCall.peer === data.from) {
            setIncomingCall(null)
          }
          break
        case 'DM_OUTCOMING_CALL_DECLINE': // Callee declined our call
          if (outcomingCall && outcomingCall.peer === data.from) {
            setOutcomingCall(null)
            setLocalMediaStream(null)
          }
          break
        case 'DM_DEVICE_MUTE_TOGGLE': // Remote peer muted or unmuted their device
          if (currentCall && currentCall.peer === data.from) {
            const { kind, enabled } = data.device
            setRemoteDeviceMuted(kind, !enabled)
          }
          break
        case 'DM_SDP_OFFER': // Used when upgrading from audio to video call
          if (!currentCall) return

          const pc = currentCall.peerConnection
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer))
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          scket?.emit('dm', {
            type: 'DM_SDP_ANSWER',
            from: user._id,
            to: currentCall.peer,
            answer,
          })
          break
        case 'DM_SDP_ANSWER': // Used when upgrading from audio to video call
          if (!currentCall) return

          const pc2 = currentCall.peerConnection
          pc2.setRemoteDescription(new RTCSessionDescription(data.answer))
          break
      }
    }
  )
}

type SocketOnOnlineStatus = {
  scket: Socket
  user: User
  addUser: (userId: string) => void
  removeUser: (userId: string) => void
  typingUsers: string[]
  setTypingUsers: Dispatch<SetStateAction<string[]>>
}

export function socketOnOnlineStatus(params: SocketOnOnlineStatus) {
  const { scket, user, addUser, removeUser, typingUsers, setTypingUsers } = params

  scket.on('onlineStatus', (data: { isOnline: boolean; isResponse: boolean; userId: string }) => {
    if (data.isOnline) {
      if (!data.isResponse) {
        scket.emit('onlineStatusResponse', { from: user._id, to: data.userId, isOnline: true, isResponse: true })
      }

      addUser(data.userId)
    } else {
      removeUser(data.userId)

      if (typingUsers.includes(data.userId)) {
        setTypingUsers((prevTypingUsers) => prevTypingUsers.filter((id) => id !== data.userId))
      }
    }
  })
}

export function socketRemoveListeners({ scket }: { scket: Socket }) {
  scket.off('message')
  scket.off('typing')
  scket.off('messageRemove')
  scket.off('error')
  scket.off('dm')
  scket.off('onlineStatus')
}
