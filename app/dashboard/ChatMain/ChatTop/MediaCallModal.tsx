import { useState, useEffect } from 'react'

import { TelephoneFill, X } from 'react-bootstrap-icons'

import useMediaCallStore from '@/app/zustand/mediaCallStore'
import useChatsStore from '@/app/zustand/chatsStore'
import useSocketStore from '@/app/zustand/socketStore'
import useUserStore from '@/app/zustand/userStore'

import Modal from '@/app/components/Modal/Modal'
import Avatar from '@/app/components/avatar/Avatar'

import { User } from '@/app/types'

function MediaCallModal() {
  const [isOpen, setIsOpen] = useState(true)
  const [friend, setFriend] = useState<User | null>(null)

  const { incomingCall, setIncomingCall, outComingCall, setOutcomingCall, setCurrentCall, setLocalMediaStream } =
    useMediaCallStore()
  const chats = useChatsStore((state) => state.chats)
  const socket = useSocketStore((state) => state.socket)
  const user = useUserStore((state) => state.user)

  useEffect(() => {
    const call = incomingCall || outComingCall

    if (call) {
      chats.forEach((chat) => {
        const u = chat.users.find((u) => u._id === call.peer)
        if (u) {
          setFriend(u)
        }
      })

      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [incomingCall, outComingCall, chats])

  return (
    friend && (
      <Modal isOpen={isOpen} setIsOpen={() => 1}>
        <Avatar src={friend.avatarUrl} size={48} alt={`${friend.firstName} ${friend.lastName}`} />

        <p>
          {incomingCall
            ? `${friend.firstName} ${friend.lastName} is calling you`
            : `Calling ${friend.firstName} ${friend.lastName}`}
        </p>

        <div className="flex">
          {incomingCall ? (
            <>
              <button
                className="bg-red-500 text-white"
                aria-label="Decline call"
                onClick={() => {
                  incomingCall.close()
                  socket?.emit('notification', {
                    from: user._id,
                    to: incomingCall.peer,
                    type: 'NOTI_OUTCOMING_CALL_DECLINE',
                  })
                  setIncomingCall(null)
                }}
              >
                <X size={24} aria-hidden />
              </button>

              <button
                className="bg-online text-white"
                aria-label="Accept call"
                onClick={async () => {
                  const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
                  incomingCall.answer(stream)
                  setCurrentCall(incomingCall)
                }}
              >
                <TelephoneFill size={24} aria-hidden />
              </button>
            </>
          ) : (
            <button
              className="bg-red-500 text-white"
              aria-label="Close call"
              onClick={() => {
                outComingCall?.close()
                setLocalMediaStream(null)
                socket?.emit('notification', {
                  from: user._id,
                  to: outComingCall?.peer,
                  type: 'NOTI_INCOMING_CALL_CLOSE',
                })
                setOutcomingCall(null)
              }}
            >
              <X size={24} aria-hidden />
            </button>
          )}
        </div>
      </Modal>
    )
  )
}

export default MediaCallModal
