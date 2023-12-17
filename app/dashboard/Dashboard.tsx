'use client'

import { useEffect } from 'react'

import ChatsPanel from './ChatsPanel/ChatsPanel'
import useChatsStore from '../zustand/chatsStore'

function DashBoard() {
  const fetchChats = useChatsStore((state) => state.fetchChats)

  useEffect(() => {
    fetchChats()
  }, [])

  return (
    <div>
      <ChatsPanel />
    </div>
  )
}

export default DashBoard
