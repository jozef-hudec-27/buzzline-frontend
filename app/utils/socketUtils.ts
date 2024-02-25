import { toast } from 'react-hot-toast'

import { User, Message, NewestMessage, ChatShow } from '../types/globalTypes'
import { MyCall, SetCallFn } from '../types/mediaCallTypes'
import { SetDeviceMutedFn, SetMediaStreamFn } from '../types/mediaStreamTypes'
import {
  AddMessageFn,
  AddRemovedMessageFn,
  FetchMessagesFn,
  RemoveMessageFn,
  SetMessagesFn,
} from '../types/chatMessagesTypes'
import { FetchChatsFn, SetChatsFn } from '../types/chatsTypes'
import { AddOnlineUserFn, RemoveOnlineUserFn } from '../types/onlineUsersTypes'
import {
  SetSocketDisconnectedFn,
  DMData,
  DMMsgNoti,
  DMCalleeInCall,
  DMIncomingCallClose,
  DMOutcomingCallDecline,
  DMSDPOffer,
  DMDeviceMuteToggle,
  DMSDPAnswer,
  DMCallerConnected,
} from '../types/socketTypes'

import { Socket } from 'socket.io-client'
import { Dispatch, SetStateAction, MutableRefObject } from 'react'

type SocketOnMessageParams = {
  scket: Socket
  user: User
  chat: ChatShow
  addMessage: AddMessageFn
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
  removeMessage: RemoveMessageFn
  addRemovedMessage: AddRemovedMessageFn
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
  setChats: SetChatsFn
  setLocalMediaStream: SetMediaStreamFn
  setRemoteDeviceMuted: SetDeviceMutedFn
  currentCall: MyCall
  incomingCall: MyCall
  setIncomingCall: SetCallFn
  outcomingCall: MyCall
  setOutcomingCall: SetCallFn
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
          | DMCallerConnected
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
        case 'DM_CALLER_CONNECTED':
          //   @ts-ignore
          window.clearTimeout(window.callerErrTimeout)
          break
      }
    }
  )
}

type SocketOnOnlineStatus = {
  scket: Socket
  user: User
  addUser: AddOnlineUserFn
  removeUser: RemoveOnlineUserFn
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

type SocketOnConnectParams = {
  scket: Socket
  disconnectedRef: MutableRefObject<boolean>
  setSocketDisconnected: SetSocketDisconnectedFn
  fetchChats: FetchChatsFn
  chat: ChatShow
  setMessages: SetMessagesFn
  fetchMessages: FetchMessagesFn
}

export function socketOnConnect(params: SocketOnConnectParams) {
  const { scket, disconnectedRef, setSocketDisconnected, fetchChats, chat, setMessages, fetchMessages } = params

  scket.on('connect', () => {
    if (!disconnectedRef.current) return

    //   If there was a network error and we're back online
    toast.success('We are back online', { position: 'bottom-left' })
    disconnectedRef.current = false
    setSocketDisconnected(false)
    fetchChats()

    if (Object.keys(chat).length) {
      scket.emit('joinRoom', chat._id)

      const updateMessages = async () => {
        const response = await fetchMessages(chat._id)
        setMessages(() => response.docs.reverse())
      }

      updateMessages()
    }
  })
}

type SocketOnDisconnectType = {
  scket: Socket
  disconnectedRef: MutableRefObject<boolean>
  setSocketDisconnected: SetSocketDisconnectedFn
  currentCall: MyCall
  setIncomingCall: SetCallFn
  setOutcomingCall: SetCallFn
  setLocalMediaStream: SetMediaStreamFn
}

export function socketOnDisconnect(params: SocketOnDisconnectType) {
  const {
    scket,
    disconnectedRef,
    setSocketDisconnected,
    currentCall,
    setIncomingCall,
    setOutcomingCall,
    setLocalMediaStream,
  } = params

  scket.on('disconnect', () => {
    toast.error('You are offline', { position: 'bottom-left' })
    disconnectedRef.current = true
    setSocketDisconnected(true)
    setIncomingCall(null)
    setOutcomingCall(null)
    if (!currentCall) setLocalMediaStream(null)
  })
}

export function socketRemoveListeners({ scket }: { scket: Socket }) {
  scket.off('message')
  scket.off('typing')
  scket.off('messageRemove')
  scket.off('error')
  scket.off('dm')
  scket.off('onlineStatus')
  scket.off('connect')
  scket.off('disconnect')
}
