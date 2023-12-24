import { useEffect, memo } from 'react'

import useSocketStore from '@/app/zustand/socketStore'
import useCurrentChatStore from '@/app/zustand/currentChatStore'
import useCurrentChatMessagesStore from '@/app/zustand/currentChatMessagesStore'

import ChatEmpty from './ChatEmpty'
import ChatTop from './ChatTop'
import ChatBottom from './ChatBottom'
import ChatThread from './ChatThread'

const ChatMain = memo(function () {
  const socket = useSocketStore((state) => state.socket)
  const { chat, isLoading: chatLoading } = useCurrentChatStore()
  const { fetchMessages, messages, isLoading: messagesLoading } = useCurrentChatMessagesStore()

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

      <ChatThread messages={messages} messagesLoading={messagesLoading} />

      <ChatBottom chat={chat} />
    </div>
  )
})

export default ChatMain
