import { useEffect, useRef } from 'react'
import { MicFill, MicMuteFill, CameraVideoFill, CameraVideoOffFill, X } from 'react-bootstrap-icons'

import useMediaCallStore from '@/app/zustand/mediaCallStore'
import useSocketStore from '@/app/zustand/socketStore'
import useUserStore from '@/app/zustand/userStore'

import Avatar from '@/app/components/avatar/Avatar'
import { accessUserMediaCatchHandler } from '@/app/utils/mediaCallUtils'

import { User, MediaStreamTrack } from '@/app/types'

function CurrentCall({ friend }: { friend: User }) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  const [
    localMediaStream,
    localMicMuted,
    localVideoMuted,
    setLocalDeviceMuted,
    remoteMediaStream,
    remoteMicMuted,
    remoteVideoMuted,
    setRemoteDeviceMuted,
    currentCall,
  ] = useMediaCallStore((state) => [
    state.localMediaStream,
    state.localMicMuted,
    state.localVideoMuted,
    state.setLocalDeviceMuted,
    state.remoteMediaStream,
    state.remoteMicMuted,
    state.remoteVideoMuted,
    state.setRemoteDeviceMuted,
    state.currentCall,
  ])
  const [socket] = useSocketStore((state) => [state.socket])
  const [user] = useUserStore((state) => [state.user])

  function initStream(
    stream: MediaStream | null,
    video: HTMLVideoElement | null,
    setDeviceMuted: (device: MediaStreamTrack, muted: boolean) => void
  ) {
    if (stream && video && !video.srcObject) {
      ;['audio', 'video'].forEach((kind) => {
        const track = stream.getTracks().find((t) => t.kind === kind)
        setDeviceMuted(kind as MediaStreamTrack, !track?.enabled)
      })

      video.srcObject = stream
      video.play()
    }
  }

  useEffect(() => {
    const localVideo = localVideoRef.current
    const remoteVideo = remoteVideoRef.current

    initStream(localMediaStream, localVideo, setLocalDeviceMuted)
    initStream(remoteMediaStream, remoteVideo, setRemoteDeviceMuted)
  }, [localMediaStream, remoteMediaStream])

  function toggleLocalDeviceMuted(kind: MediaStreamTrack) {
    if (!localMediaStream) return
    const track = localMediaStream.getTracks().find((t) => t.kind === kind)

    if (track) {
      const enabled = !track.enabled
      track.enabled = enabled

      socket?.emit('notification', {
        from: user._id,
        to: friend?._id,
        type: 'NOTI_DEVICE_MUTE_TOGGLE',
        device: { kind, enabled },
      })

      setLocalDeviceMuted(kind, !enabled)
    } else {
      const getTrack = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ [kind]: true })
        const newTrack = stream.getTracks()[0]
        return newTrack
      }

      getTrack()
        .then((track) => {
          localMediaStream.addTrack(track)
          setLocalDeviceMuted(kind, !track.enabled)
          // @ts-ignore
          window.callUpgrade = true
          currentCall?.peerConnection.addTrack(track, localMediaStream) // triggers the negotiationneeded event
        })
        .catch((e) => accessUserMediaCatchHandler(e, kind === 'video', true))
    }
  }

  return (
    currentCall && (
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
            className={`w-[320px] h-auto rounded-[8px] border-[2px] border-primary ${localVideoMuted && 'hidden'}`}
            ref={localVideoRef}
          ></video>
        </div>

        <div className="bg-[rgb(0,0,0,0.8)]">
          <video className="w-[960px] h-[540px]" ref={remoteVideoRef}></video>
          {remoteVideoMuted && (
            <>
              <Avatar
                cls="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2"
                src={friend.avatarUrl}
                size={200}
                alt={`${friend.firstName} ${friend.lastName} avatar`}
              />
            </>
          )}
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 px-[20px] py-[12px] rounded-full bottom-[12px] flex justify-center items-center gap-[20px] bg-[rgb(0,0,0,0.6)]">
          <button
            className="current-call__action bg-white"
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
            className="current-call__action bg-white"
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
            className="current-call__action bg-red-500"
            onClick={() => currentCall.close()}
            aria-label="Close call"
          >
            <X size={20} aria-hidden />
          </button>
        </div>
      </div>
    )
  )
}

export default CurrentCall
