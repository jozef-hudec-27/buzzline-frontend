'use client'

import { Socket } from 'socket.io-client'
import { useEffect } from 'react'

import useCurrentChatStore from '@/app/zustand/currentChatStore'
import ChatEmpty from './ChatEmpty'
import ChatTop from './ChatTop'
import ChatBottom from './ChatBottom'

type ChatMainProps = {
  socket: Socket | null
}

function ChatMain({ socket }: ChatMainProps) {
  const chat = useCurrentChatStore((state) => state.chat)
  const chatLoading = useCurrentChatStore((state) => state.isLoading)

  useEffect(() => {
    if (!Object.keys(chat).length) {
      return
    }

    socket?.emit('joinRoom', chat._id)
  }, [chat, socket])

  if (!chatLoading && !Object.keys(chat).length) {
    return <ChatEmpty />
  } else if (chatLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Loading chat...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <ChatTop chat={chat} />

      <p className="flex-1">{chat.users[0].firstName}</p>

      <ChatBottom chat={chat} />
    </div>
  )
}

export default ChatMain
