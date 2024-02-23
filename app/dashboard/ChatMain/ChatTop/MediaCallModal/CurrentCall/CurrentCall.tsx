import { useEffect, useRef } from 'react'
import { MicFill, MicMuteFill, CameraVideoFill, CameraVideoOffFill, X } from 'react-bootstrap-icons'
import { toast } from 'react-hot-toast'

import useUserStore from '@/app/zustand/userStore'
import useSocketStore from '@/app/zustand/socketStore'
import useMediaCallStore from '@/app/zustand/webrtc/mediaCallStore'
import useMediaStreamStore from '@/app/zustand/webrtc/mediaStreamStore'

import LocalVideo from './LocalVideo'
import Avatar from '@/app/components/avatar/Avatar'
import { accessUserMediaCatchHandler } from '@/app/utils/mediaCallUtils'

import { User, MediaStreamTrack } from '@/app/types'

function CurrentCall({ friend }: { friend: User }) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  const [user] = useUserStore((state) => [state.user])
  const [socket] = useSocketStore((state) => [state.socket])
  const [currentCall] = useMediaCallStore((state) => [state.currentCall])
  const [
    localMediaStream,
    localMicMuted,
    localVideoMuted,
    setLocalDeviceMuted,
    remoteMediaStream,
    remoteMicMuted,
    remoteVideoMuted,
    setRemoteDeviceMuted,
  ] = useMediaStreamStore((state) => [
    state.localMediaStream,
    state.localMicMuted,
    state.localVideoMuted,
    state.setLocalDeviceMuted,
    state.remoteMediaStream,
    state.remoteMicMuted,
    state.remoteVideoMuted,
    state.setRemoteDeviceMuted,
  ])

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

  function showCameraTip() {
    if (localStorage.getItem('cameraTipShown')) return

    toast('Pro tip: You can hide your camera by clicking on it.', { icon: '📹', duration: 8000 })
    localStorage.setItem('cameraTipShown', 'true')
  }

  useEffect(() => {
    const localVideo = localVideoRef.current
    const remoteVideo = remoteVideoRef.current

    initStream(localMediaStream, localVideo, setLocalDeviceMuted)
    initStream(remoteMediaStream, remoteVideo, setRemoteDeviceMuted)

    if (localMediaStream?.getVideoTracks().length) {
      showCameraTip()
    }
  }, [localMediaStream, remoteMediaStream])

  function toggleLocalDeviceMuted(kind: MediaStreamTrack) {
    if (!localMediaStream) return
    const track = localMediaStream.getTracks().find((t) => t.kind === kind)

    if (track) {
      const enabled = !track.enabled
      track.enabled = enabled

      socket?.emit('dm', {
        from: user._id,
        to: friend?._id,
        type: 'DM_DEVICE_MUTE_TOGGLE',
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

          if (kind === 'video') {
            showCameraTip()
          }
        })
        .catch((e) => accessUserMediaCatchHandler(e, kind === 'video', true))
    }
  }

  return (
    currentCall && (
      <div className="w-fit relative mx-auto">
        {remoteMicMuted && (
          <span
            className="absolute top-[16px] left-[16px] z-10"
            aria-label={`${friend.firstName}'s microphone is muted`}
            title={`${friend.firstName}'s microphone is muted`}
          >
            <MicMuteFill className="text-white" size={16} />
          </span>
        )}

        <LocalVideo videoRef={localVideoRef} />

        <div className="bg-[rgb(0,0,0)] rounded-[8px]">
          <video className="w-[960px] h-[540px] rounded-[8px]" ref={remoteVideoRef}></video>
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
            title={`${localMicMuted ? 'Unmute' : 'Mute'} microphone`}
          >
            {!localMicMuted ? (
              <MicFill className="text-primary" size={24} aria-hidden />
            ) : (
              <MicMuteFill className="text-primary" size={24} aria-hidden />
            )}
          </button>
          <button
            className="current-call__action bg-white"
            onClick={() => toggleLocalDeviceMuted('video')}
            aria-label={`${localVideoMuted ? 'un' : ''}mute camera`}
            title={`${localVideoMuted ? 'Unmute' : 'Mute'} camera`}
          >
            {!localVideoMuted ? (
              <CameraVideoFill className="text-primary" size={24} aria-hidden />
            ) : (
              <CameraVideoOffFill className="text-primary" size={24} aria-hidden />
            )}
          </button>
          <button
            className="current-call__action bg-red-500"
            onClick={() => currentCall.close()}
            aria-label="Close call"
            title="Close call"
          >
            <X size={24} aria-hidden />
          </button>
        </div>
      </div>
    )
  )
}

export default CurrentCall
