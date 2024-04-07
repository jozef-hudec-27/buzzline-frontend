import { useEffect, useState, memo } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Steps } from 'intro.js-react'

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
  const [AIGuideShown, setAIGuideShown] = useAIChatStore((state) => [state.guideShown, state.setGuideShown])

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

  return (
    <div className="flex-1 flex flex-col h-0 sm:h-auto">
      <ChatTop />

      <ChatThread fetchOlderMessages={fetchOlderMessages} initialLoading={initialLoading} />

      <ChatBottom />

      <div
        className={`${
          !typingUsers.length && 'hidden'
        } fixed left-1/2 -translate-x-1/2 bottom-[64px] bg-[rgb(255,255,255,0.9)] border border-black-5 shadow py-[8px] px-[16px] rounded-[24px]`}
      >
        {Array.from(new Set(typingUsers)).map((userId) => {
          const userFirstName = chat.users.find((u) => u._id === userId)?.firstName

          if (!userFirstName) return

          return (
            <p key={`typing-${userId}`} className="text-[13px]">
              {restrictLength(userFirstName, 30)} is typing<span className="pulsing-dot">.</span>
              <span className="pulsing-dot">.</span>
              <span className="pulsing-dot">.</span>✍️
            </p>
          )
        })}
      </div>

      <Steps
        steps={[
          {
            intro: `<div class="flex flex-col gap-[24px]">
                <h4>👋 Welcome to My AI!</h4>
                <p>You need to know this before using My AI:</p>
                <ul class="list-disc list-inside">
                    <li>It operates using generative AI technology. While safety measures have been incorporated into its design, please be aware that its responses may occasionally exhibit bias, inaccuracies, or even provide misleading or harmful information. It's advisable not to solely depend on its advice.</li>
                    <li>Sharing sensitive or confidential information is not recommended.</li>
                </ul>
              </div>`,
          },
          {
            element: '#clear-ai-conversation',
            intro: `<div class="flex flex-col gap-[24px]">
                  <h4>🗑️ Clearing the conversation</h4>
                  <ul class="list-disc list-inside">
                    <li>You can clear your conversation with My AI here. Keep in mind this action is irreversible and your messages will be deleted forever.</li>
                    <li>In rare cases (most often due to bad input), My AI gets stuck and can't generate new responses. If this happens, clearing the conversation is your best bet.</li>
                  </ul>
                </div>`,
          },
          {
            element: '.context-aware-switch',
            intro: `<div class="flex flex-col gap-[24px]">
                  <h4>🤖 Context-aware AI</h4>
                  <ul class="list-disc list-inside">
                    <li>When enabled, My AI will remember the context of your conversation and provide more relevant responses.</li>
                    <li>When disabled, My AI will not remember the context of your conversation.</li>
                  </ul>
                </div>`,
          },
        ]}
        initialStep={0}
        onExit={() => setAIGuideShown(true)}
        ref={(steps) => {
          if (steps?.props?.options) {
            steps.props.options.doneLabel = 'Done'
            steps.props.options.hideNext = false
          }
        }}
        enabled={chat.isAI && !AIGuideShown}
      />
    </div>
  )
})

export default ChatMain
