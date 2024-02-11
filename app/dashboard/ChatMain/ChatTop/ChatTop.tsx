import { TelephoneFill, CameraVideoFill, ThreeDots } from 'react-bootstrap-icons'
import { toast } from 'react-hot-toast'

import useOnlineUsersStore from '@/app/zustand/onlineUsersStore'
import useCurrentChatStore from '@/app/zustand/currentChatStore'
import usePeerStore from '@/app/zustand/peerStore'
import useMediaCallStore from '@/app/zustand/mediaCallStore'

import Avatar from '@/app/components/avatar/Avatar'
import { restrictLength } from '@/app/utils'
import { accessUserMediaCatchHandler } from '@/app/mediaCallUtils'

function ChatTop() {
  const { isOnline } = useOnlineUsersStore()
  const chat = useCurrentChatStore((state) => state.chat)
  const peer = usePeerStore((state) => state.peer)
  const { setOutcomingCall, currentCall, setCurrentCall, setLocalMediaStream, setRemoteMediaStream } =
    useMediaCallStore((state) => ({
      setOutcomingCall: state.setOutcomingCall,
      currentCall: state.currentCall,
      setCurrentCall: state.setCurrentCall,
      setLocalMediaStream: state.setLocalMediaStream,
      setRemoteMediaStream: state.setRemoteMediaStream,
    }))

  const chatName = `${chat.users[0].firstName} ${chat.users[0].lastName}`
  const online = chat.users.some((user) => isOnline(user._id))

  async function callUser(video: boolean, remotePeerId: string) {
    if (currentCall) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video })
      setLocalMediaStream(stream)

      const call = peer?.call(remotePeerId, stream, { metadata: { video } })

      call?.on('close', () => {
        setCurrentCall(null)
        stream.getTracks().forEach((track) => track.stop())
      })

      call?.on('stream', (remoteStream) => {
        setCurrentCall(call)
        setRemoteMediaStream(remoteStream)
      })

      if (call) setOutcomingCall(call)
    } catch (e) {
      accessUserMediaCatchHandler(e, video)
    }
  }

  return (
    <div className="px-[12px] py-[10px] flex items-center justify-between border-b border-black-10 shadow">
      <div className="flex items-center gap-[10px]">
        <div className="min-w-[36px] min-h-[36px] relative">
          <Avatar src={chat.users[0].avatarUrl} alt={chatName} size={36} />

          {online && <div className="online-dot" aria-label="Online"></div>}
        </div>

        <p>{restrictLength(chatName, 50)}</p>
      </div>

      <div className="flex items-center gap-[24px]">
        <button
          className="chat-icon"
          aria-label="Audio call"
          title="Audio Call"
          onClick={() => callUser(false, chat.users[0]._id)}
        >
          <TelephoneFill size={20} aria-hidden />
        </button>

        <button
          className="chat-icon"
          aria-label="Video call"
          title="Video Call"
          onClick={() => callUser(true, chat.users[0]._id)}
        >
          <CameraVideoFill size={20} aria-hidden />
        </button>

        {/* <button className="chat-icon" aria-label="Options">
          <ThreeDots size={20} aria-hidden />
        </button> */}
      </div>
    </div>
  )
}

export default ChatTop
