import { CameraVideoFill, TelephoneFill, X } from 'react-bootstrap-icons'

import useMediaCallStore from '@/app/zustand/mediaCallStore'
import useSocketStore from '@/app/zustand/socketStore'
import useUserStore from '@/app/zustand/userStore'

import Avatar from '@/app/components/avatar/Avatar'
import { accessUserMediaCatchHandler, closeOutcomingCall as closeMyCall } from '@/app/mediaCallUtils'

import { User } from '@/app/types'

function ComingCall({ friend }: { friend: User }) {
  const { incomingCall, setIncomingCall, outcomingCall, setOutcomingCall, setCurrentCall, setLocalMediaStream } =
    useMediaCallStore()
  const [socket] = useSocketStore((state) => [state.socket])
  const [user] = useUserStore((state) => [state.user])

  function closeOutcomingCall() {
    closeMyCall({ paramsType: 'val', userId: user._id, socket, outcomingCall, setOutcomingCall, setLocalMediaStream })
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

  return (
    <div className="flex flex-col items-center gap-[24px]">
      <Avatar src={friend.avatarUrl} size={160} alt={`${friend.firstName} ${friend.lastName}`} />

      <div className="flex flex-col items-center gap-[4px]">
        <p className="text-3xl text-black-100 font-bold">
          {friend.firstName} {friend.lastName}
        </p>

        <p>{incomingCall ? `is calling you...` : `you're calling...`}</p>
      </div>

      <div className="flex">
        {incomingCall ? (
          <div className="flex gap-[24px]">
            <button
              className="coming-call__action bg-red-500"
              aria-label={`Decline ${incomingCall.metadata?.video ? 'video' : 'audio'} call`}
              onClick={declineIncomingCall}
            >
              <X size={28} aria-hidden />
            </button>

            <button
              className="coming-call__action bg-online"
              aria-label={`Accept ${incomingCall.metadata?.video ? 'video' : 'audio'} call`}
              onClick={answerIncomingCall}
            >
              {incomingCall.metadata?.video ? (
                <CameraVideoFill size={28} aria-hidden />
              ) : (
                <TelephoneFill size={28} aria-hidden />
              )}
            </button>
          </div>
        ) : (
          <button className="coming-call__action bg-red-500" onClick={closeOutcomingCall} aria-label="Close call">
            <X size={28} aria-hidden />
          </button>
        )}
      </div>
    </div>
  )
}

export default ComingCall
