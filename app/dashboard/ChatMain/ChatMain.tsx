import { useEffect, useState, memo } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import useUserStore from '@/app/zustand/userStore'
import useSocketStore from '@/app/zustand/socketStore'
import useCurrentChatStore from '@/app/zustand/currentChatStore'
import useCurrentChatMessagesStore from '@/app/zustand/currentChatMessagesStore'
import useChatsStore from '@/app/zustand/chatsStore'
import useAIChatStore from '@/app/zustand/aiChatStore'

import ChatEmpty from './ChatEmpty'
import ChatTop from './ChatTop/ChatTop'
import ChatBottom from './ChatBottom/ChatBottom'
import ChatThread from './ChatThread/ChatThread'
import AIChatGuide from './AIChat/AIChatGuide'
import api from '@/app/api/axiosInstance'
import { restrictLength } from '@/app/utils/utils'

type ChatMainProps = {
  typingUsers: string[]
  setTypingUsers: React.Dispatch<React.SetStateAction<string[]>>
}

const ChatMain = memo(function ({ typingUsers, setTypingUsers }: ChatMainProps) {
  const [user] = useUserStore((state) => [state.user])
  const [socket] = useSocketStore((state) => [state.socket])
  const [chat, chatLoading] = useCurrentChatStore((state) => [state.chat, state.isLoading])
  const [fetchMessages, setMessages, messagesLoading, initialLoading] = useCurrentChatMessagesStore((state) => [
    state.fetchMessages,
    state.setMessages,
    state.isLoading,
    state.initialLoading,
  ])
  const [updateChats] = useChatsStore((state) => [state.updateChats])
  const [isAIGeneratingResponse] = useAIChatStore((state) => [state.isGeneratingResponse])

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
      updateChats(
        chat._id,
        (chat) => ({
          ...chat,
          newestMessage: chat.newestMessage
            ? { ...chat.newestMessage, readBy: [...chat.newestMessage.readBy, user._id] }
            : undefined,
        }),
        'replace'
      )
    },
  })

  useEffect(() => {
    if (!Object.keys(chat).length) {
      return
    }

    const getMessages = async () => {
      try {
        const response = await fetchMessages(chat._id, undefined, true)
        setMessages(response.docs.reverse())
        setNextMessagesPage(response.nextPage)
      } catch (err) {
        toast('Error fetching messages.', { icon: '❌' })
      }
    }
    getMessages()

    socket?.emit('joinRoom', chat._id)

    setTypingUsers([])

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

  const typing = isAIGeneratingResponse
    ? Array.from(new Set(typingUsers)).concat(['ai'])
    : Array.from(new Set(typingUsers))

  return (
    <div className="flex-1 flex flex-col h-0 sm:h-auto">
      <ChatTop />

      <ChatThread fetchOlderMessages={fetchOlderMessages} initialLoading={initialLoading} />

      <ChatBottom />

      <div
        className={`${
          !typingUsers.length && !isAIGeneratingResponse && 'hidden'
        } fixed left-1/2 -translate-x-1/2 bottom-[64px] bg-[rgb(255,255,255,0.9)] border border-black-5 shadow py-[8px] px-[16px] rounded-[24px]`}
      >
        {typing.map((userId) => {
          const userFirstName = userId === 'ai' ? 'ai' : chat.users.find((u) => u._id === userId)?.firstName

          if (!userFirstName) return

          return (
            <p key={`typing-${userId}`} className="text-[13px]">
              {isAIGeneratingResponse ? 'AI' : restrictLength(userFirstName, 30)}{' '}
              {isAIGeneratingResponse ? 'is generating a response' : 'is typing'}
              <span className="pulsing-dot">.</span>
              <span className="pulsing-dot">.</span>
              <span className="pulsing-dot">.</span>
              {isAIGeneratingResponse ? '🤖' : '✍️'}
            </p>
          )
        })}
      </div>

      <AIChatGuide />
    </div>
  )
})

export default ChatMain
