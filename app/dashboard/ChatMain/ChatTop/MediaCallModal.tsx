import { useState, useEffect, useRef, use } from 'react'
import { TelephoneFill, CameraVideoFill, X } from 'react-bootstrap-icons'

import useMediaCallStore from '@/app/zustand/mediaCallStore'
import useChatsStore from '@/app/zustand/chatsStore'
import useSocketStore from '@/app/zustand/socketStore'
import useUserStore from '@/app/zustand/userStore'

import Modal from '@/app/components/Modal/Modal'
import Avatar from '@/app/components/avatar/Avatar'
import { accessUserMediaCatchHandler } from '@/app/mediaCallUtils'

import { User } from '@/app/types'

function MediaCallModal() {
  const [isOpen, setIsOpen] = useState(true)
  const [friend, setFriend] = useState<User | null>(null)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  const {
    incomingCall,
    setIncomingCall,
    outcomingCall,
    setOutcomingCall,
    currentCall,
    setCurrentCall,
    localMediaStream,
    setLocalMediaStream,
    remoteMediaStream,
  } = useMediaCallStore()
  const chats = useChatsStore((state) => state.chats)
  const socket = useSocketStore((state) => state.socket)
  const user = useUserStore((state) => state.user)

  function closeOutcomingCall() {
    setLocalMediaStream(null)
    socket?.emit('notification', {
      from: user._id,
      to: outcomingCall?.peer,
      type: 'NOTI_INCOMING_CALL_CLOSE',
    })
    setOutcomingCall(null)
  }

  function declineIncomingCall() {
    socket?.emit('notification', {
      from: user._id,
      to: incomingCall?.peer,
      type: 'NOTI_OUTCOMING_CALL_DECLINE',
    })
    setIncomingCall(null)
  }

  async function answerIncomingCall() {
    const isVideoCall = !!incomingCall?.metadata?.video

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideoCall })
      incomingCall?.answer(stream)
      setLocalMediaStream(stream)
      setCurrentCall(incomingCall)
    } catch (e) {
      accessUserMediaCatchHandler(e, isVideoCall)
      declineIncomingCall()
    }
  }

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
    const localVideo = localVideoRef.current
    const remoteVideo = remoteVideoRef.current

    if (localMediaStream && localVideo && !localVideo.srcObject) {
      localVideo.srcObject = localMediaStream
      localVideo.play()
    }

    if (remoteMediaStream && remoteVideo && !remoteVideo.srcObject) {
      remoteVideo.srcObject = remoteMediaStream
      remoteVideo.play()
    }
  }, [localMediaStream, remoteMediaStream])

  return (
    friend && (
      <Modal isOpen={isOpen} setIsOpen={function () {}}>
        {currentCall ? (
          <>
            <div className="flex">
              <video className="w-[400px] h-[300px]" ref={localVideoRef}></video>
              <video className="w-[400px] h-[300px]" ref={remoteVideoRef}></video>
            </div>
          </>
        ) : (
          <>
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
                    aria-label={`Decline ${incomingCall.metadata?.video ? 'video' : 'audio'} call`}
                    onClick={declineIncomingCall}
                  >
                    <X size={24} aria-hidden />
                  </button>

                  <button
                    className="bg-online text-white"
                    aria-label={`Accept ${incomingCall.metadata?.video ? 'video' : 'audio'} call`}
                    onClick={answerIncomingCall}
                  >
                    {incomingCall.metadata?.video ? (
                      <CameraVideoFill size={24} aria-hidden />
                    ) : (
                      <TelephoneFill size={24} aria-hidden />
                    )}
                  </button>
                </>
              ) : (
                <button className="bg-red-500 text-white" aria-label="Close call" onClick={closeOutcomingCall}>
                  <X size={24} aria-hidden />
                </button>
              )}
            </div>
          </>
        )}
      </Modal>
    )
  )
}

export default MediaCallModal
