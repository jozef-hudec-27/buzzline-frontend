'use client'

import { useEffect } from 'react'

import ChatsPanel from './ChatsPanel/ChatsPanel'
import useChatsStore from '../zustand/chatsStore'
import ChatMain from './ChatMain/ChatMain'

function DashBoard() {
  const fetchChats = useChatsStore((state) => state.fetchChats)

  useEffect(() => {
    fetchChats()
  }, [])

  return (
    <div className='flex'>
      <ChatsPanel />

      <ChatMain />
    </div>
  )
}

export default DashBoard
