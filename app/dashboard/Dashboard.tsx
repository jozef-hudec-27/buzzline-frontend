'use client'

import { useEffect } from 'react'

import Chats from './Chats'
import useChatsStore from '../zustand/chatsStore'

function DashBoard() {
  const fetchChats = useChatsStore((state) => state.fetchChats)

  useEffect(() => {
    fetchChats()
  }, [])

  return (
    <div>
      <Chats />
    </div>
  )
}

export default DashBoard
