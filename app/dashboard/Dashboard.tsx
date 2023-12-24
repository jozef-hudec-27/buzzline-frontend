'use client'

import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'

import useUserStore from '../zustand/userStore'
import useCurrentChatStore from '../zustand/currentChatStore'
import useChatsStore from '../zustand/chatsStore'
import useSocketStore from '../zustand/socketStore'
import useCurrentChatMessagesStore from '../zustand/currentChatMessagesStore'

import ChatsPanel from './ChatsPanel/ChatsPanel'
import PeoplePanel from './PeoplePanel/PeoplePanel'
import ChatMain from './ChatMain/ChatMain'
import Sidebar from './Sidebar/Sidebar'

import { Message } from '@/app/types'

function DashBoard() {
  const { addMessage } = useCurrentChatMessagesStore()
  const { socket, setSocket } = useSocketStore()
  const { user } = useUserStore()
  const { chat } = useCurrentChatStore()
  const { fetchChats, setChats, hasFetched } = useChatsStore()

  const [leftPanel, setLeftPanel] = useState<'chats' | 'people'>('chats')

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

    setSocket(scket)

    if (!hasFetched) {
      fetchChats()
    }

    return () => {
      scket.off('message')
      scket.off('error')
      scket.off('notification')
    }
  }, [chat, user, hasFetched])

  return (
    <div className="flex max-h-[100vh]">
      <Sidebar leftPanel={leftPanel} setLeftPanel={setLeftPanel} />

      <div className="flex flex-col">
        <div className={leftPanel === 'people' ? 'hidden' : ''}>
          <ChatsPanel />
        </div>

        <div className={leftPanel === 'chats' ? 'hidden' : ''}>
          <PeoplePanel />
        </div>
      </div>

      <ChatMain />
    </div>
  )
}

export default DashBoard
