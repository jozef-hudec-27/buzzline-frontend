'use client'

import { useEffect } from 'react'

import useSocketStore from '@/app/zustand/socketStore'
import useCurrentChatStore from '@/app/zustand/currentChatStore'
import useCurrentChatMessagesStore from '@/app/zustand/currentChatMessagesStore'
import ChatEmpty from './ChatEmpty'
import ChatTop from './ChatTop'
import ChatBottom from './ChatBottom'

function ChatMain() {
  const socket = useSocketStore((state) => state.socket)

  const chat = useCurrentChatStore((state) => state.chat)
  const chatLoading = useCurrentChatStore((state) => state.isLoading)

  const fetchMessages = useCurrentChatMessagesStore((state) => state.fetchMessages)
  const messages = useCurrentChatMessagesStore((state) => state.messages)
  const setMessages = useCurrentChatMessagesStore((state) => state.setMessages)
  const messagesLoading = useCurrentChatMessagesStore((state) => state.isLoading)

  useEffect(() => {
    if (!Object.keys(chat).length) {
      return
    }

    fetchMessages(chat._id)

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

      <div className="messages flex-1">
        {messagesLoading ? (
          <div>Loading messages...</div>
        ) : (
          <div>
            {messages.map((msg, i) => {
              return <div key={i}>{msg.content}</div>
            })}
          </div>
        )}
      </div>

      <ChatBottom chat={chat} />
    </div>
  )
}

export default ChatMain
