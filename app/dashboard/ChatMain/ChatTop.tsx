import Image from 'next/image'
import { TelephoneFill, CameraVideoFill, ThreeDots } from 'react-bootstrap-icons'

import { ChatShow } from '@/app/types'

function ChatTop({ chat }: { chat: ChatShow }) {
  return (
    <div className="px-[12px] py-[10px] flex items-center justify-between border-b border-black-10 shadow">
      <div className="flex items-center gap-[10px]">
        <Image
          src="https://faceboom.onrender.com/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBCZz09IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--e4a44a7bd0b470dc8d229be0daebaa1accc5deea/default-avatar.svg"
          alt="avatar"
          width={36}
          height={36}
          className="w-[36px] h-[36px] rounded-full"
        />

        <p>
          {chat.users[0].firstName} {chat.users[0].lastName}
        </p>
      </div>

      <div className="flex items-center gap-[24px]">
        <button className="chat-icon" aria-label="Audio call">
          <TelephoneFill size={20} aria-hidden />
        </button>

        <button className="chat-icon" aria-label="Video call">
          <CameraVideoFill size={20} aria-hidden />
        </button>

        <button className="chat-icon" aria-label="Options">
          <ThreeDots size={20} aria-hidden />
        </button>
      </div>
    </div>
  )
}

export default ChatTop
