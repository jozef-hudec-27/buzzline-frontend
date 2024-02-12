'use client'

import { useEffect, useState } from 'react'

import useUserStore from '@/app/zustand/userStore'
import useCurrentChatStore from '@/app/zustand/currentChatStore'
import useChatsStore from '@/app/zustand/chatsStore'
import useOnlineUsersStore from '@/app/zustand/onlineUsersStore'

import Avatar from '@/app/components/avatar/Avatar'
import { restrictLength, timeSince, randomInt } from '@/app/utils'

import { ChatIndex } from '@/app/types'

type ChatProps = {
  chat: ChatIndex
  hideNewestMessage?: boolean
}

function Chat({ chat, hideNewestMessage }: ChatProps) {
  const user = useUserStore((state) => state.user)
  const fetchChat = useCurrentChatStore((state) => state.fetchChat)
  const setChats = useChatsStore((state) => state.setChats)
  const { isOnline } = useOnlineUsersStore()

  const [hasUnreadMsg, setHasUnreadMsg] = useState(false)

  const chatName = `${chat.users[0].firstName} ${chat.users[0].lastName}`
  const online = chat.users.some((user) => isOnline(user._id))

  useEffect(() => {
    const { newestMessage } = chat

    if (newestMessage && newestMessage.sender !== user._id && !newestMessage.readBy.includes(user._id)) {
      setHasUnreadMsg(true)
    } else {
      setHasUnreadMsg(false)
    }
  }, [chat, user])

  return (
    <button
      className="p-[6px] flex flex-col lg:flex-row items-center gap-0 lg:gap-[10px] rounded-[8px] hover:bg-black-5 focus:bg-black-5 outline-none cursor-pointer"
      onClick={(e) => {
        fetchChat(chat._id)

        if (randomInt(1, 5) > 3) {
          // Rerender ChatsPanel to update newestMessage
          setChats((prevChats) => prevChats)
        }
      }}
    >
      <div className="min-w-[48px] min-h-[48px] relative">
        <Avatar src={chat.users[0].avatarUrl} alt={chatName} size={48} />

        {online && <div className="user-online-dot" aria-label="Online"></div>}
      </div>

      <div className="w-full flex items-center justify-between">
        <div className="flex flex-col items-start">
          <p className={`${hasUnreadMsg && 'font-semibold'} hidden lg:block`}>{restrictLength(chatName, 30)}</p>

          {!hideNewestMessage && chat.newestMessage && (
            <div
              className={`${
                hasUnreadMsg && 'font-semibold'
              } text-[13px] text-black-65 hidden lg:flex items-center gap-[4px]`}
            >
              {chat.newestMessage.sender === user._id && <p>You:</p>}

              <p
                className={
                  chat.newestMessage.isRemoved || chat.newestMessage.voiceClipUrl || chat.newestMessage.imageUrl
                    ? 'italic'
                    : ''
                }
              >
                {chat.newestMessage.isRemoved
                  ? 'Message removed'
                  : chat.newestMessage.voiceClipUrl
                  ? 'Voice clip'
                  : chat.newestMessage.imageUrl
                  ? 'Image'
                  : restrictLength(chat.newestMessage.content, 25)}
              </p>

              <p>· {timeSince(chat.newestMessage.createdAt)}</p>
            </div>
          )}
        </div>

        {hasUnreadMsg && <div className="w-[8px] h-[8px] bg-secondary rounded-full" aria-hidden></div>}
      </div>
    </button>
  )
}

export default Chat
