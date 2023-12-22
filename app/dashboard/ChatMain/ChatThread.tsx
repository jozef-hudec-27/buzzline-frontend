import Image from 'next/image'

import useUserStore from '@/app/zustand/userStore'

import { Message } from '@/app/types'

type ChatThreadProps = {
  messages: Message[]
  messagesLoading: boolean
}

function ChatThread({ messages, messagesLoading }: ChatThreadProps) {
  if (messagesLoading) {
    return <div>Loading messages...</div>
  }

  const user = useUserStore((state) => state.user)

  return (
    <div className="flex-1">
      <div className="flex flex-col gap-[4px] px-[16px] pt-[10px]">
        {messages.map((msg, i) => {
          return (
            <div
              key={i}
              className={`flex items-end gap-[8px] ${msg.sender._id === user._id ? 'self-end' : ''} ${
                i > 0 && messages[i - 1].sender._id !== msg.sender._id ? 'mt-[60px]' : ''
              }`}
            >
              {msg.sender._id !== user._id && (
                <Image
                  src="https://faceboom.onrender.com/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBCZz09IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--e4a44a7bd0b470dc8d229be0daebaa1accc5deea/default-avatar.svg"
                  alt="avatar"
                  width={28}
                  height={28}
                  className={`w-[28px] h-[28px] rounded-full relative top-[4px] ${
                    messages[i + 1]?.sender._id === msg.sender._id ? 'opacity-0' : ''
                  }`}
                />
              )}

              <div className={`message ${msg.sender._id === user._id ? 'own' : 'other'} `}>{msg.content}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ChatThread
