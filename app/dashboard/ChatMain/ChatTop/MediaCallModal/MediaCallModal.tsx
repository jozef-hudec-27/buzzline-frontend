import { useState, useEffect } from 'react'

import useMediaCallStore from '@/app/zustand/mediaCallStore'
import useChatsStore from '@/app/zustand/chatsStore'

import CurrentCall from './CurrentCall'
import ComingCall from './ComingCall'
import Modal from '@/app/components/Modal/Modal'

import { User } from '@/app/types'

function MediaCallModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [friend, setFriend] = useState<User | null>(null)

  const { incomingCall, outcomingCall, currentCall } = useMediaCallStore()
  const [chats] = useChatsStore((state) => [state.chats])

  useEffect(() => {
    const call = incomingCall || outcomingCall || currentCall

    if (call) {
      if (!friend) {
        for (let i = 0; i < chats.length; i++) {
          const u = chats[i].users.find((u) => u._id === call.peer)

          if (u) {
            setFriend(u)
            break
          }
        }
      }

      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [incomingCall, outcomingCall, currentCall, friend, chats])

  useEffect(() => {
    const ringtoneAudio = document.getElementById('ringtone-audio') as HTMLAudioElement
    if (!ringtoneAudio) return

    ringtoneAudio.currentTime = 0

    const play = isOpen && !currentCall

    if (play) {
      ringtoneAudio.play().catch(function () {})
    } else {
      ringtoneAudio.pause()
      ringtoneAudio.currentTime = 999 // finish audio track
    }
  }, [currentCall, isOpen])

  return (
    friend && (
      <Modal
        isOpen={isOpen}
        setIsOpen={function () {}}
        contentLabel={
          currentCall
            ? `Call with ${friend.firstName} modal`
            : incomingCall
            ? `Calling ${friend.firstName} modal`
            : `Incoming call from ${friend.firstName} modal`
        }
        cls={currentCall ? '!w-full !bg-transparent' : '!lg:w-1/3'}
      >
        {currentCall ? <CurrentCall friend={friend} /> : <ComingCall friend={friend} />}
      </Modal>
    )
  )
}

export default MediaCallModal
