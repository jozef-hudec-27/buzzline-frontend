import { useEffect, useRef } from 'react'

import useCurrentChatMessagesStore from '@/app/zustand/currentChatMessagesStore'

import Message from './Message'

type ChatThreadProps = {
  fetchOlderMessages: () => Promise<boolean>
  initialLoading: boolean
}

function ChatThread({ fetchOlderMessages, initialLoading }: ChatThreadProps) {
  if (initialLoading) {
    return <div className="flex-1 flex justify-center items-center">Loading messages...</div>
  }

  const messages = useCurrentChatMessagesStore((state) => state.messages)

  const threadRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to bottom when chat opened
    if (messages.length > 20) return

    threadRef.current?.scrollTo(0, threadRef.current?.scrollHeight)
  }, [messages])

  useEffect(() => {
    // Scroll to bottom when new message, if already at bottom
    if (messages.length <= 20) return

    const messagesEl = threadRef.current
    if (
      messages.length &&
      messagesEl &&
      messagesEl?.scrollHeight - messagesEl?.scrollTop - messagesEl?.clientHeight < 200
    ) {
      threadRef.current?.scrollTo(0, threadRef.current?.scrollHeight)
    }
  }, [messages, threadRef])

  return (
    <div
      id="message-thread"
      className="flex-1 overflow-y-scroll"
      ref={threadRef}
      onScroll={async (e) => {
        const messagesEl = e.target as HTMLDivElement

        if (messagesEl.scrollTop > 0) return

        const prevHeight = messagesEl.scrollHeight
        const fetched = await fetchOlderMessages()

        if (fetched) {
          const heightDiff = messagesEl.scrollHeight - prevHeight
          messagesEl.scrollTop = heightDiff
        }
      }}
    >
      <div className="flex flex-col gap-[4px] px-[16px] pt-[10px]">
        {messages.map((msg, i) => {
          return <Message key={msg._id} initialMsg={msg} i={i} />
        })}
      </div>
    </div>
  )
}

export default ChatThread
