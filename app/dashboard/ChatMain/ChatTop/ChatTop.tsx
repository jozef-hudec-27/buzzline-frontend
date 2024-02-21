import { TelephoneFill, CameraVideoFill, ThreeDots } from 'react-bootstrap-icons'
import { toast } from 'react-hot-toast'

import useOnlineUsersStore from '@/app/zustand/onlineUsersStore'
import useCurrentChatStore from '@/app/zustand/currentChatStore'
import usePeerStore from '@/app/zustand/peerStore'
import useMediaCallStore from '@/app/zustand/mediaCallStore'
import useSocketStore from '@/app/zustand/socketStore'

import Avatar from '@/app/components/avatar/Avatar'
import { restrictLength } from '@/app/utils/utils'
import { accessUserMediaCatchHandler, closeOutcomingCall } from '@/app/utils/mediaCallUtils'
import { configurePeerConnection } from '@/app/utils/peerUtils'

function ChatTop() {
  const [isOnline] = useOnlineUsersStore((state) => [state.isOnline])
  const [chat] = useCurrentChatStore((state) => [state.chat])
  const [peer] = usePeerStore((state) => [state.peer])
  const [
    outcomingCallRef,
    setOutcomingCall,
    currentCall,
    setCurrentCall,
    setLocalMediaStream,
    setRemoteMediaStream,
    setRemoteDeviceMuted,
  ] = useMediaCallStore((state) => [
    state.outcomingCallRef,
    state.setOutcomingCall,
    state.currentCall,
    state.setCurrentCall,
    state.setLocalMediaStream,
    state.setRemoteMediaStream,
    state.setRemoteDeviceMuted,
  ])
  const [socket] = useSocketStore((state) => [state.socket])

  const chatName = `${chat.users[0].firstName} ${chat.users[0].lastName}`
  const online = chat.users.some((user) => isOnline(user._id))

  async function callUser(video: boolean, remotePeerId: string) {
    if (currentCall || !peer) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video })
      setLocalMediaStream(stream)

      const call = peer.call(remotePeerId, stream, { metadata: { video } })

      if (!call) return

      call.on('close', () => {
        setCurrentCall(null)
        setLocalMediaStream(null)
        setRemoteMediaStream(null)
      })

      call.on('stream', (remoteStream) => {
        setCurrentCall(call)
        setRemoteMediaStream(remoteStream)
      })

      configurePeerConnection({ pc: call.peerConnection, socket, from: peer.id, to: call.peer, setRemoteDeviceMuted })

      setOutcomingCall(call)

      setTimeout(() => {
        if (call.open || call !== outcomingCallRef.current) return
        closeOutcomingCall({
          paramsType: 'val',
          userId: peer.id,
          socket,
          outcomingCall: call,
          setOutcomingCall,
          setLocalMediaStream,
        })
      }, 30000)
    } catch (e) {
      accessUserMediaCatchHandler(e, video)
    }
  }

  return (
    <div className="px-[12px] py-[10px] flex items-center justify-between border-b border-black-10 shadow">
      <div className="flex items-center gap-[10px]">
        <div className="min-w-[36px] min-h-[36px] relative">
          <Avatar src={chat.users[0].avatarUrl} alt={chatName} size={36} />

          {online && <div className="user-online-dot" aria-label="Online"></div>}
        </div>

        <p>{restrictLength(chatName, 50)}</p>
      </div>

      <div className="flex items-center gap-[24px]">
        <button
          className="chat__icon-btn"
          aria-label="Audio call"
          title="Audio Call"
          onClick={() => callUser(false, chat.users[0]._id)}
        >
          <TelephoneFill size={20} aria-hidden />
        </button>

        <button
          className="chat__icon-btn"
          aria-label="Video call"
          title="Video Call"
          onClick={() => callUser(true, chat.users[0]._id)}
        >
          <CameraVideoFill size={20} aria-hidden />
        </button>

        {/* <button className="chat__icon-btn" aria-label="Options">
          <ThreeDots size={20} aria-hidden />
        </button> */}
      </div>
    </div>
  )
}

export default ChatTop
