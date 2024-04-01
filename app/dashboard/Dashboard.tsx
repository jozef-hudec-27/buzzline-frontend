'use client'

import { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'

import useUserStore from '../zustand/userStore'
import useSocketStore from '../zustand/socketStore'
import useChatsStore from '../zustand/chatsStore'
import useCurrentChatStore from '../zustand/currentChatStore'
import useCurrentChatMessagesStore from '../zustand/currentChatMessagesStore'
import useOnlineUsersStore from '../zustand/onlineUsersStore'
import useRemovedMessagesStore from '../zustand/removedMessagesStore'
import useMediaCallStore from '../zustand/webrtc/mediaCallStore'
import useMediaStreamStore from '../zustand/webrtc/mediaStreamStore'

import ChatsPanel from './ChatsPanel/ChatsPanel'
import PeoplePanel from './PeoplePanel/PeoplePanel'
import ChatMain from './ChatMain/ChatMain'
import Sidebar from './Sidebar/Sidebar'
import MediaCallModal from './ChatMain/ChatTop/MediaCallModal/MediaCallModal'
import SocketDisconnectedModal from './SocketDisconnectedModal'
import RemoveMessageModal from './ChatMain/ChatThread/RemoveMessageModal'
import ClearAIConversationModal from './ChatMain/ChatTop/ClearAIConversationModal'
import {
  socketOnMessage,
  socketOnMessageRemove,
  socketOnDM,
  socketOnError,
  socketOnOnlineStatus,
  socketOnTyping,
  socketOnConnect,
  socketOnDisconnect,
  socketRemoveListeners,
} from '../utils/socketUtils'

function DashBoard() {
  const [addMessage, removeMessage, fetchMessages, setMessages] = useCurrentChatMessagesStore((state) => [
    state.addMessage,
    state.removeMessage,
    state.fetchMessages,
    state.setMessages,
  ])
  const [socket, setSocket, setSocketDisconnected] = useSocketStore((state) => [
    state.socket,
    state.setSocket,
    state.setSocketDisconnected,
  ])
  const [user] = useUserStore((state) => [state.user])
  const [chat] = useCurrentChatStore((state) => [state.chat])
  const [fetchChats, setChats, hasFetched] = useChatsStore((state) => [
    state.fetchChats,
    state.setChats,
    state.hasFetched,
  ])
  const [addUser, removeUser] = useOnlineUsersStore((state) => [state.addUser, state.removeUser])
  const [addRemovedMessage] = useRemovedMessagesStore((state) => [state.addRemovedMessage])
  const [currentCall, incomingCall, setIncomingCall, outcomingCall, setOutcomingCall] = useMediaCallStore((state) => [
    state.currentCall,
    state.incomingCall,
    state.setIncomingCall,
    state.outcomingCall,
    state.setOutcomingCall,
  ])
  const [setLocalMediaStream, setRemoteDeviceMuted] = useMediaStreamStore((state) => [
    state.setLocalMediaStream,
    state.setRemoteDeviceMuted,
  ])

  const [leftPanel, setLeftPanel] = useState<'chats' | 'people'>('chats')
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const disconnectedRef = useRef(false)

  useEffect(() => {
    if (socket && socket.disconnected) {
      socket.connect()
    }

    const scket =
      socket || io(process.env.NEXT_PUBLIC_BASE_URL || '', { query: { token: localStorage.getItem('accessToken') } })

    // Socket event listeners
    socketOnMessage({ scket, user, addMessage, chat })
    socketOnTyping({ scket, user, typingUsers, setTypingUsers })
    socketOnMessageRemove({ scket, removeMessage, addRemovedMessage })
    socketOnError({ scket })
    socketOnDM({
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
    })
    socketOnOnlineStatus({ scket, user, addUser, removeUser, typingUsers, setTypingUsers })
    socketOnConnect({ scket, disconnectedRef, setSocketDisconnected, fetchChats, chat, fetchMessages, setMessages })
    socketOnDisconnect({
      scket,
      disconnectedRef,
      setSocketDisconnected,
      currentCall,
      setIncomingCall,
      setOutcomingCall,
      setLocalMediaStream,
    })

    setSocket(scket)

    if (!hasFetched) {
      fetchChats()
    }

    return () => {
      socketRemoveListeners({ scket })
    }
  }, [chat, user, hasFetched, typingUsers, currentCall, incomingCall, outcomingCall])

  return (
    <div className="flex flex-col sm:flex-row h-[100vh] ">
      <Sidebar leftPanel={leftPanel} setLeftPanel={setLeftPanel} />

      <div className="flex flex-col">
        <div className={leftPanel === 'people' ? 'hidden' : ''}>
          <ChatsPanel />
        </div>

        <div className={leftPanel === 'chats' ? 'hidden' : ''}>
          <PeoplePanel />
        </div>
      </div>

      <ChatMain typingUsers={typingUsers} setTypingUsers={setTypingUsers} />

      <audio src="assets/sounds/message-notification.mp3" className="hidden" id="noti-audio"></audio>
      <audio src="assets/sounds/call-ringtone.mp3" className="hidden" id="ringtone-audio"></audio>

      <MediaCallModal />
      <SocketDisconnectedModal />
      <RemoveMessageModal />
      <ClearAIConversationModal />
    </div>
  )
}

export default DashBoard
