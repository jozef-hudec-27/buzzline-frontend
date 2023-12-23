'use client'

import { useState } from 'react'
import { MicFill, Image, HandThumbsUpFill, EmojiSmileFill } from 'react-bootstrap-icons'
import useSocketStore from '@/app/zustand/socketStore'
import toast from 'react-hot-toast'

import { ChatShow } from '@/app/types'

function ChatBottom({ chat }: { chat: ChatShow }) {
  const socket = useSocketStore((state) => state.socket)
  const [message, setMessage] = useState('')

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!message.length || message.length > 500) return

    socket?.emit('message', { chat: chat._id, content: message })
    setMessage('')
  }

  return (
    <div className="px-[16px] py-[10px] flex items-center gap-[16px]">
      <button className="chat-icon" aria-label="Send a voice clip">
        <MicFill size={20} aria-hidden />
      </button>

      <button className="chat-icon" aria-label="Attach a file">
        <Image size={20} aria-hidden />
      </button>

      <form className="py-[12px] px-[24px] flex items-center bg-black-5 flex-1 rounded-full" onSubmit={onSubmit}>
        <input
          type="text"
          className="pr-[12px] bg-black-5 placeholder:text-black-50 text-black-75 flex-1 outline-none"
          placeholder="Aa"
          aria-label="Message"
          value={message}
          onChange={(e) => {
            if (e.target.value.length > 500) {
              return toast('Maximum message length is 500 characters', { icon: '❌' })
            }

            setMessage(e.target.value)
          }}
        />

        <button type="button" className="chat-icon" aria-label="Choose an emoji">
          <EmojiSmileFill size={20} aria-hidden />
        </button>
      </form>

      <button className="chat-icon" aria-label="Send a like">
        <HandThumbsUpFill size={20} aria-hidden />
      </button>
    </div>
  )
}

export default ChatBottom
