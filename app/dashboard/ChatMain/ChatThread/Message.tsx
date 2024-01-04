import { useState, useEffect } from 'react'
import ReactAudioPlayer from 'react-h5-audio-player'
import Image from 'next/image'
import { Tooltip } from 'react-tooltip'

import useUserStore from '@/app/zustand/userStore'
import useRemovedMessagesStore from '@/app/zustand/removedMessagesStore'
import useCurrentChatMessagesStore from '@/app/zustand/currentChatMessagesStore'

import Avatar from '@/app/components/avatar/Avatar'

import { Message, User } from '@/app/types'
import RemoveMessageModal from './RemoveMessageModal'

type MessageProps = {
  initialMsg: Message
  i: number
}

function Message({ initialMsg, i }: MessageProps) {
  const user = useUserStore((state) => state.user)
  const removedMessages = useRemovedMessagesStore((state) => state.removedMessages)
  const messages = useCurrentChatMessagesStore((state) => state.messages)

  const [msg, setMsg] = useState<Message>(initialMsg)
  const [holdTimer, setHoldTimer] = useState<NodeJS.Timeout | null>(null)
  const [showRemoveMessageModal, setShowRemoveMessageModal] = useState(false)

  useEffect(() => {
    if (removedMessages.includes(msg._id) && !msg.isRemoved) {
      setMsg((prev) => ({ ...prev, isRemoved: true, content: '', imageUrl: undefined, voiceClipUrl: undefined }))
    }
  }, [removedMessages, msg])

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

  function msgBelongsToUser(msg: Message, user: User): boolean {
    return msg?.sender._id === user._id
  }

  const handleMouseDown = () => {
    const timer = setTimeout(() => {
      setShowRemoveMessageModal(true)
    }, 1000)

    setHoldTimer(timer)
  }

  const handleMouseUp = () => {
    if (!holdTimer) return
    clearTimeout(holdTimer)
  }

  return (
    <div
      key={msg._id}
      className={`flex items-end gap-[8px] ${msgBelongsToUser(msg, user) ? 'self-end' : ''} ${
        i > 0 && !msgBelongsToUser(messages[i - 1], msg.sender) ? 'mt-[60px]' : ''
      }`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
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
        {msg.isRemoved ? (
          <div className="italic">Message removed</div>
        ) : msg.voiceClipUrl ? (
          <div className="flex items-center justify-center w-[280px] sm:w-[400px]">
            <ReactAudioPlayer
              src={msg.voiceClipUrl.replace('.webm', '.mp3')}
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

      {!msg.isRemoved && msg.sender._id === user._id && (
        <RemoveMessageModal isOpen={showRemoveMessageModal} setIsOpen={setShowRemoveMessageModal} message={msg} />
      )}
    </div>
  )
}

export default Message
