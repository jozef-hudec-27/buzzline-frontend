import { useState, useEffect, useRef } from 'react'
import { TelephoneFill, CameraVideoFill, CameraVideoOffFill, X, MicFill, MicMuteFill } from 'react-bootstrap-icons'

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
    localMicMuted,
    localVideoMuted,
    setLocalDeviceMuted,
    remoteMicMuted,
    remoteVideoMuted,
    setRemoteDeviceMuted,
  } = useMediaCallStore()
  const [chats] = useChatsStore((state) => [state.chats])
  const [socket] = useSocketStore((state) => [state.socket])
  const [user] = useUserStore((state) => [state.user])

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
      localMediaStream.getTracks().forEach((track) => {
        setLocalDeviceMuted(track.kind as 'audio' | 'video', !track.enabled)
      })

      localVideo.srcObject = localMediaStream
      localVideo.play()
    }

    if (remoteMediaStream && remoteVideo && !remoteVideo.srcObject) {
      remoteMediaStream.getTracks().forEach((track) => {
        setRemoteDeviceMuted(track.kind as 'audio' | 'video', !track.enabled)
      })

      remoteVideo.srcObject = remoteMediaStream
      remoteVideo.play()
    }
  }, [localMediaStream, remoteMediaStream])

  function toggleLocalDeviceMuted(kind: 'audio' | 'video') {
    if (!localMediaStream) return

    localMediaStream.getTracks().forEach((track) => {
      if (track.kind !== kind) return

      const enabled = !track.enabled
      track.enabled = enabled

      socket?.emit('notification', {
        from: user._id,
        to: friend?._id,
        type: 'NOTI_DEVICE_MUTE_TOGGLE',
        device: { kind, enabled },
      })

      setLocalDeviceMuted(kind, !enabled)
    })
  }

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
        cls={currentCall ? '!w-full !bg-transparent' : undefined}
      >
        {currentCall ? (
          <>
            <div>
              <div className="w-fit relative mx-auto">
                {remoteMicMuted && (
                  <MicMuteFill
                    className="absolute top-[16px] left-[16px] text-white"
                    size={16}
                    aria-label={`${friend.firstName}'s microphone is muted`}
                  />
                )}

                <div className="absolute top-[16px] right-[16px]">
                  <video
                    className={`w-[320px] h-auto rounded-[8px] border-[2px] border-primary ${
                      localVideoMuted && 'hidden'
                    }`}
                    ref={localVideoRef}
                  ></video>
                </div>

                <div className="bg-[rgb(0,0,0,0.8)]">
                  <video className="w-[960px] h-[540px]" ref={remoteVideoRef}></video>
                  {remoteVideoMuted && (
                    <img
                      className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 rounded-full"
                      src={friend.avatarUrl}
                      alt={`${friend.firstName} ${friend.lastName} avatar`}
                    />
                  )}
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 px-[20px] py-[12px] rounded-full bottom-[12px] flex justify-center items-center gap-[20px] bg-[rgb(0,0,0,0.6)]">
                  <button
                    className="p-[6px] bg-white rounded-full hover:opacity-90 focus:opacity-90"
                    onClick={() => toggleLocalDeviceMuted('audio')}
                    aria-label={`${localMicMuted ? 'un' : ''}mute microphone`}
                  >
                    {!localMicMuted ? (
                      <MicFill className="text-primary" size={20} aria-hidden />
                    ) : (
                      <MicMuteFill className="text-primary" size={20} aria-hidden />
                    )}
                  </button>
                  <button
                    className="p-[6px] bg-white rounded-full hover:opacity-90 focus:opacity-90"
                    onClick={() => toggleLocalDeviceMuted('video')}
                    aria-label={`${localMicMuted ? 'un' : ''}mute camera`}
                  >
                    {!localVideoMuted ? (
                      <CameraVideoFill className="text-primary" size={20} aria-hidden />
                    ) : (
                      <CameraVideoOffFill className="text-primary" size={20} aria-hidden />
                    )}
                  </button>
                  <button
                    className="p-[6px] bg-red-500 rounded-full hover:opacity-90 focus:opacity-90"
                    onClick={() => currentCall.close()}
                    aria-label="Close call"
                  >
                    <X className="text-white" size={20} aria-hidden />
                  </button>
                </div>
              </div>
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
