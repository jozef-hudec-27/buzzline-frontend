'use client'

import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'

import useUserStore from '../zustand/userStore'
import useCurrentChatStore from '../zustand/currentChatStore'
import useChatsStore from '../zustand/chatsStore'
import useSocketStore from '../zustand/socketStore'
import useCurrentChatMessagesStore from '../zustand/currentChatMessagesStore'
import useOnlineUsersStore from '../zustand/onlineUsersStore'
import useRemovedMessagesStore from '../zustand/removedMessagesStore'
import useMediaCallStore from '../zustand/mediaCallStore'

import ChatsPanel from './ChatsPanel/ChatsPanel'
import PeoplePanel from './PeoplePanel/PeoplePanel'
import ChatMain from './ChatMain/ChatMain'
import Sidebar from './Sidebar/Sidebar'
import MediaCallModal from './ChatMain/ChatTop/MediaCallModal'

import { Message } from '@/app/types'

function DashBoard() {
  const { addMessage, removeMessage } = useCurrentChatMessagesStore((state) => ({
    addMessage: state.addMessage,
    removeMessage: state.removeMessage,
  }))
  const { socket, setSocket } = useSocketStore()
  const user = useUserStore((state) => state.user)
  const chat = useCurrentChatStore((state) => state.chat)
  const { fetchChats, setChats, hasFetched } = useChatsStore((state) => ({
    fetchChats: state.fetchChats,
    setChats: state.setChats,
    hasFetched: state.hasFetched,
  }))
  const { addUser, removeUser } = useOnlineUsersStore((state) => ({
    addUser: state.addUser,
    removeUser: state.removeUser,
  }))
  const addRemovedMessage = useRemovedMessagesStore((state) => state.addRemovedMessage)
  const { incomingCall, setIncomingCall, outComingCall, setOutcomingCall, setLocalMediaStream } = useMediaCallStore(
    (state) => ({
      incomingCall: state.incomingCall,
      setIncomingCall: state.setIncomingCall,
      outComingCall: state.outComingCall,
      setOutcomingCall: state.setOutcomingCall,
      setLocalMediaStream: state.setLocalMediaStream,
    })
  )

  const [leftPanel, setLeftPanel] = useState<'chats' | 'people'>('chats')
  const [typingUsers, setTypingUsers] = useState<string[]>([])

  useEffect(() => {
    const scket =
      socket || io(process.env.NEXT_PUBLIC_BASE_URL || '', { query: { token: localStorage.getItem('accessToken') } })

    scket.on('message', (data: Message) => {
      addMessage(data)

      if (data.sender._id === user._id) {
        // Send notification to all participants
        chat?.users?.concat([user]).forEach((participant) => {
          scket.emit('notification', {
            from: chat._id,
            to: participant._id,
            type: 'NOTI_MESSAGE',
            message: data,
          })
        })
      }
    })

    scket.on('typing', (data: { userId: string; isTyping: boolean }) => {
      const { userId, isTyping } = data

      if (userId === user._id) return

      if (isTyping && !typingUsers.includes(userId)) {
        setTypingUsers((prevTypingUsers) => [...prevTypingUsers, userId])
      } else if (!isTyping) {
        setTypingUsers((prevTypingUsers) => prevTypingUsers.filter((id) => id !== userId))
      }
    })

    scket.on('messageRemove', (data: { messageId: string }) => {
      removeMessage(data.messageId) // Remove from Zustand store
      addRemovedMessage(data.messageId) // Make sure message component rerenders
    })

    scket.on('error', (data: string) => {
      toast(data, { icon: '❌' })
    })

    scket.on('notification', (data) => {
      switch (data.type) {
        case 'NOTI_MESSAGE':
          if (data.message?.sender?._id !== user._id && data.from !== chat?._id) {
            const notiAudio = document.getElementById('noti-audio') as HTMLAudioElement
            notiAudio?.play()
          }

          // Update chats panel
          setChats((prevChats) => {
            let chat = prevChats.find((chat) => chat._id === data.from)
            if (!chat) return prevChats

            chat = { ...chat, newestMessage: data.message }
            const updatedChats = [chat, ...prevChats.filter((chat) => chat._id !== data.from)]
            return updatedChats
          })
          break
        case 'NOTI_CALLEE_IN_CALL':
          toast('User is in another call', { icon: '❌' })
          break
        case 'NOTI_INCOMING_CALL_CLOSE':
          if (incomingCall && incomingCall.peer === data.from) {
            incomingCall.close()
            setIncomingCall(null)
            toast('Call declined by caller', { icon: '❌' })
          }
          break
        case 'NOTI_OUTCOMING_CALL_DECLINE':
          if (outComingCall && outComingCall.peer === data.from) {
            outComingCall.close()
            setOutcomingCall(null)
            setLocalMediaStream(null)
            toast('Call declined by callee', { icon: '❌' })
          }
          break
      }
    })

    scket.on('onlineStatus', (data) => {
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

    setSocket(scket)

    if (!hasFetched) {
      fetchChats()
    }

    return () => {
      scket.off('message')
      scket.off('typing')
      scket.off('messageRemove')
      scket.off('error')
      scket.off('notification')
      scket.off('onlineStatus')
    }
  }, [chat, user, hasFetched, typingUsers, incomingCall, outComingCall])

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

      <audio src="assets/sounds/noti.wav" className="hidden" id="noti-audio"></audio>

      <MediaCallModal />
    </div>
  )
}

export default DashBoard
