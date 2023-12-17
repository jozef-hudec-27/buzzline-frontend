'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

import { Chat as TChat } from '@/app/zustand/chatsStore'
import useUserStore from '@/app/zustand/userStore'

function Chats({ chat }: { chat: TChat }) {
  const user = useUserStore((state) => state.user)
  const [hasUnreadMsg, setHasUnreadMsg] = useState(false)

  useEffect(() => {
    const { newestMessage } = chat

    if (newestMessage && newestMessage.sender !== user._id && !newestMessage.readBy.includes(user._id)) {
      setHasUnreadMsg(true)
    }
  }, [chat, user])

  return (
    <div className="p-[6px] flex items-center gap-[10px] rounded-[8px] hover:bg-black-5 cursor-pointer">
      <Image
        src="https://faceboom.onrender.com/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBCZz09IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--e4a44a7bd0b470dc8d229be0daebaa1accc5deea/default-avatar.svg"
        alt="avatar"
        width={48}
        height={48}
        className="w-[48px] h-[48px] rounded-full"
      />

      <div className="w-full flex items-center justify-between">
        <div className="flex flex-col">
          <p className={`${hasUnreadMsg && 'font-semibold'}`}>
            {chat.users[0].firstName} {chat.users[0].lastName}
          </p>

          {chat.newestMessage && (
            <p className={`${hasUnreadMsg && 'font-semibold'} font-[13px] text-black-65`}>
              {chat.newestMessage.content}
            </p>
          )}
        </div>

        {hasUnreadMsg && <div className="w-[8px] h-[8px] bg-secondary rounded-full" aria-hidden></div>}
      </div>
    </div>
  )
}

export default Chats
