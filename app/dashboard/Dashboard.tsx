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

import ChatsPanel from './ChatsPanel/ChatsPanel'
import PeoplePanel from './PeoplePanel/PeoplePanel'
import ChatMain from './ChatMain/ChatMain'
import Sidebar from './Sidebar/Sidebar'

import { Message } from '@/app/types'

function DashBoard() {
  const addMessage = useCurrentChatMessagesStore((state) => state.addMessage)
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

  const [leftPanel, setLeftPanel] = useState<'chats' | 'people'>('chats')
  const [typingUsers, setTypingUsers] = useState<string[]>([])

  useEffect(() => {
    const scket = socket || io('http://localhost:4000', { query: { token: localStorage.getItem('accessToken') } })

    scket.on('message', (data: Message) => {
      addMessage(data)

      if (data.sender._id === user._id) {
        // Send notification to all participants
        chat?.users?.concat([user]).forEach((participant) => {
          scket.emit('notification', {
            from: chat._id,
            to: participant._id,
            type: 'message',
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

    scket.on('error', (data: string) => {
      toast(data, { icon: '❌' })
    })

    scket.on('notification', (data) => {
      if (data.type === 'message') {
        // Update chats panel
        setChats((prevChats) => {
          let chat = prevChats.find((chat) => chat._id === data.from)
          if (!chat) return prevChats

          chat = { ...chat, newestMessage: data.message }
          const updatedChats = [chat, ...prevChats.filter((chat) => chat._id !== data.from)]
          return updatedChats
        })
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
      scket.off('error')
      scket.off('notification')
      scket.off('onlineStatus')
    }
  }, [chat, user, hasFetched, typingUsers])

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
    </div>
  )
}

export default DashBoard
