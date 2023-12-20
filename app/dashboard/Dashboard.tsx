'use client'

import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

import useChatsStore from '../zustand/chatsStore'
import ChatsPanel from './ChatsPanel/ChatsPanel'
import PeoplePanel from './PeoplePanel/PeoplePanel'
import ChatMain from './ChatMain/ChatMain'
import Sidebar from './Sidebar/Sidebar'

function DashBoard() {
  const fetchChats = useChatsStore((state) => state.fetchChats)
  const [leftPanel, setLeftPanel] = useState<'chats' | 'people'>('chats')
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    setSocket(io('http://localhost:4000'))
    fetchChats()
  }, [])

  return (
    <div className="flex">
      <Sidebar leftPanel={leftPanel} setLeftPanel={setLeftPanel} />

      <div className="flex flex-col">
        <div className={leftPanel === 'people' ? 'hidden' : ''}>
          <ChatsPanel />
        </div>

        <div className={leftPanel === 'chats' ? 'hidden' : ''}>
          <PeoplePanel />
        </div>
      </div>

      <ChatMain socket={socket} />
    </div>
  )
}

export default DashBoard
