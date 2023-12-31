import { useEffect, useState, memo } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import useUserStore from '@/app/zustand/userStore'
import useSocketStore from '@/app/zustand/socketStore'
import useCurrentChatStore from '@/app/zustand/currentChatStore'
import useCurrentChatMessagesStore from '@/app/zustand/currentChatMessagesStore'
import useChatsStore from '@/app/zustand/chatsStore'

import ChatEmpty from './ChatEmpty'
import ChatTop from './ChatTop'
import ChatBottom from './ChatBottom/ChatBottom'
import ChatThread from './ChatThread'
import api from '@/app/api/axiosInstance'

const ChatMain = memo(function () {
  const user = useUserStore((state) => state.user)
  const socket = useSocketStore((state) => state.socket)
  const { chat, isLoading: chatLoading } = useCurrentChatStore()
  const {
    fetchMessages,
    setMessages,
    messages,
    isLoading: messagesLoading,
    initialLoading,
  } = useCurrentChatMessagesStore()
  const setChats = useChatsStore((state) => state.setChats)

  const [nextMessagesPage, setNextMessagesPage] = useState<null | number>(null)

  const fetchOlderMessages = async () => {
    if (!nextMessagesPage || messagesLoading || initialLoading) return false

    try {
      const response = await fetchMessages(chat._id, nextMessagesPage)
      setNextMessagesPage(response.nextPage)
      setMessages((prevMessages) => [...response.docs.reverse(), ...prevMessages])
    } catch (err) {
      toast('Error fetching messages.', { icon: '❌' })
    }

    return true
  }

  const readUnreadMessagesMutation = useMutation({
    mutationFn: async () => {
      await api(true).post(`/api/chats/${chat._id}/messages/read`)
    },
    onSuccess: () => {
      //   Update left sidebar
      // @ts-ignore
      setChats((prevChats) => {
        const chatIndex = prevChats.findIndex((c) => c._id === chat._id)

        if (chatIndex === -1 || prevChats[chatIndex].newestMessage === undefined) {
          return prevChats
        }

        const updatedChat = {
          ...prevChats[chatIndex],
          newestMessage: {
            ...prevChats[chatIndex].newestMessage,
            // @ts-ignore
            readBy: [...prevChats[chatIndex].newestMessage.readBy, user._id],
          },
        }

        return [...prevChats.slice(0, chatIndex), updatedChat, ...prevChats.slice(chatIndex + 1)]
      })
    },
  })

  useEffect(() => {
    if (!Object.keys(chat).length) {
      return
    }

    const getMessages = async () => {
      try {
        const response = await fetchMessages(chat._id, undefined, true)
        setMessages((prevMessages) => response.docs.reverse())
        setNextMessagesPage(response.nextPage)
      } catch (err) {
        toast('Error fetching messages.', { icon: '❌' })
      }
    }
    getMessages()

    socket?.emit('joinRoom', chat._id)

    // Read unread messages, only if not sent and read by current user
    if (chat.newestMessage?.sender !== user._id && !chat.newestMessage?.readBy.includes(user._id)) {
      readUnreadMessagesMutation.mutate()
    }
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
    <div className="flex-1 flex flex-col h-0 sm:h-auto">
      <ChatTop chat={chat} />

      <ChatThread messages={messages} messagesLoading={initialLoading} fetchOlderMessages={fetchOlderMessages} />

      <ChatBottom chat={chat} />
    </div>
  )
})

export default ChatMain
