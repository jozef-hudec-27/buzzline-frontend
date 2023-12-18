'use client'

import { useEffect, useState } from 'react'

import useChatsStore from '../zustand/chatsStore'
import ChatsPanel from './ChatsPanel/ChatsPanel'
import PeoplePanel from './PeoplePanel/PeoplePanel'
import ChatMain from './ChatMain/ChatMain'
import Sidebar from './Sidebar/Sidebar'

function DashBoard() {
  const fetchChats = useChatsStore((state) => state.fetchChats)
  const [leftPanel, setLeftPanel] = useState<'chats' | 'people'>('chats')

  useEffect(() => {
    fetchChats()
  }, [])

  return (
    <div className="flex">
      <Sidebar leftPanel={leftPanel} setLeftPanel={setLeftPanel} />

      {/* {leftPanel === 'chats' ? <ChatsPanel /> : <PeoplePanel />} */}
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
