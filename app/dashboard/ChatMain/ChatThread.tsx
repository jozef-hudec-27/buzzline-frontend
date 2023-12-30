'use client'

import { useEffect, useRef } from 'react'
import { Tooltip } from 'react-tooltip'
import ReactAudioPlayer from 'react-h5-audio-player'
import Image from 'next/image'

import useUserStore from '@/app/zustand/userStore'

import Avatar from '@/app/components/avatar/Avatar'

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
    return <div className="flex-1 flex justify-center items-center">Loading messages...</div>
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

  function messageTooltip(msg: Message) {
    return {
      anchorSelect: `#tooltip-${msg._id}`,
      arrowColor: 'transparent',
      content: new Date(msg.createdAt).toLocaleString('en-GB', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      offset: 4,
      delayShow: 400,
    }
  }

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
                <Avatar
                  src={msg.sender.avatarUrl}
                  alt={`${user.firstName} ${user.lastName}`}
                  size={28}
                  cls={`w-[28px] h-[28px] relative top-[4px] ${
                    msgBelongsToUser(messages[i + 1], msg.sender) ? 'opacity-0' : ''
                  }`}
                />
              )}

              <div
                className={`message ${msgBelongsToUser(msg, user) ? 'own' : 'other'} ${
                  msg.imageUrl || msg.content === '👍' ? '!bg-white' : ''
                } ${msg.content === '👍' ? 'text-[64px]' : ''}`}
                id={`tooltip-${msg._id}`}
              >
                {msg.voiceClipUrl ? (
                  <div className="flex items-center justify-center w-[280px] sm:w-[400px]">
                    <ReactAudioPlayer
                      src={msg.voiceClipUrl}
                      showJumpControls={false}
                      showDownloadProgress={false}
                      layout="horizontal-reverse"
                      defaultDuration=""
                      defaultCurrentTime="00:00"
                      timeFormat="mm:ss"
                    />
                  </div>
                ) : msg.imageUrl ? (
                  <Image
                    src={msg.imageUrl}
                    alt={`Message from ${msg.sender.firstName}`}
                    width={300}
                    height={300}
                    className="w-[300px] h-auto rounded-[24px] drop-shadow-sm"
                  />
                ) : (
                  msg.content
                )}
              </div>

              {/* Tooltip for larger devices */}
              <Tooltip
                {...messageTooltip(msg)}
                className="hidden sm:block !rounded-[8px] !bg-black-100 !drop-shadow-md z-10"
                place={msgBelongsToUser(msg, user) ? 'left' : 'right'}
              />

              {/* Tooltip for mobile devices */}
              <Tooltip
                {...messageTooltip(msg)}
                className="sm:hidden !rounded-[8px] !bg-black-100 !drop-shadow-md z-10"
                place="bottom"
                // @ts-ignore
                openEvents={msg.voiceClipUrl && []}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ChatThread
