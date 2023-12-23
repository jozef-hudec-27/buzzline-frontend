'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { Tooltip } from 'react-tooltip'

import useUserStore from '@/app/zustand/userStore'

import { Message, User } from '@/app/types'

function msgBelongsToUser(msg: Message, user: User): boolean {
  return msg?.sender._id === user._id
}

type ChatThreadProps = {
  messages: Message[]
  messagesLoading: boolean
}

function ChatThread({ messages, messagesLoading }: ChatThreadProps) {
  if (messagesLoading) {
    return <div className="flex-1">Loading messages...</div>
  }

  const threadRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to bottom when chat opened
    threadRef.current?.scrollTo(0, threadRef.current?.scrollHeight)
  }, [])

  useEffect(() => {
    // Scroll to bottom when new message, if already at bottom
    const messagesEl = threadRef.current
    if (
      messages.length &&
      messagesEl &&
      messagesEl?.scrollHeight - messagesEl?.scrollTop - messagesEl?.clientHeight < 200
    ) {
      threadRef.current?.scrollTo(0, threadRef.current?.scrollHeight)
    }
  }, [messages, threadRef])

  const user = useUserStore((state) => state.user)

  return (
    <div className="flex-1 overflow-y-scroll" ref={threadRef}>
      <div className="flex flex-col gap-[4px] px-[16px] pt-[10px]">
        {messages.map((msg, i) => {
          return (
            <div
              key={msg._id}
              className={`flex items-end gap-[8px] ${msgBelongsToUser(msg, user) ? 'self-end' : ''} ${
                i > 0 && !msgBelongsToUser(messages[i - 1], msg.sender) ? 'mt-[60px]' : ''
              }`}
            >
              {!msgBelongsToUser(msg, user) && (
                <Image
                  src="https://faceboom.onrender.com/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBCZz09IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--e4a44a7bd0b470dc8d229be0daebaa1accc5deea/default-avatar.svg"
                  alt="avatar"
                  width={28}
                  height={28}
                  className={`w-[28px] h-[28px] rounded-full relative top-[4px] ${
                    msgBelongsToUser(messages[i + 1], msg.sender) ? 'opacity-0' : ''
                  }`}
                />
              )}

              <div
                className={`message ${msgBelongsToUser(msg, user) ? 'own' : 'other'} `}
                data-tooltip-id={`tooltip-${msg._id}`}
                data-tooltip-content={new Date(msg.createdAt).toLocaleString('en-GB', {
                  year: '2-digit',
                  month: '2-digit',
                  day: '2-digit',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
                data-tooltip-place={msgBelongsToUser(msg, user) ? 'left' : 'right'}
                data-tooltip-delay-show={400}
              >
                {msg.content}
              </div>

              <Tooltip id={`tooltip-${msg._id}`} className="!rounded-[8px] !bg-black-100 !drop-shadow-md" arrowColor="transparent" offset={4} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ChatThread
