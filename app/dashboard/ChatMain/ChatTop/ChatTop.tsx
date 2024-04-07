import { TelephoneFill, CameraVideoFill, ThreeDots, TrashFill } from 'react-bootstrap-icons'
import Switch from 'react-switch'
import { Tooltip } from 'react-tooltip'

import useSocketStore from '@/app/zustand/socketStore'
import useOnlineUsersStore from '@/app/zustand/onlineUsersStore'
import useCurrentChatStore from '@/app/zustand/currentChatStore'
import usePeerStore from '@/app/zustand/webrtc/peerStore'
import useMediaCallStore from '@/app/zustand/webrtc/mediaCallStore'
import useMediaStreamStore from '@/app/zustand/webrtc/mediaStreamStore'
import useAIChatStore from '@/app/zustand/aiChatStore'

import Avatar from '@/app/components/avatar/Avatar'
import { restrictLength } from '@/app/utils/utils'
import { accessUserMediaCatchHandler, closeOutcomingCall, addTrackToPeerConnection } from '@/app/utils/mediaCallUtils'
import { configurePeerConnection } from '@/app/utils/peerUtils'

import AIAvatar from '/public/assets/images/my-ai-avatar.svg'

function ChatTop() {
  const [socket] = useSocketStore((state) => [state.socket])
  const [isOnline] = useOnlineUsersStore((state) => [state.isOnline])
  const [chat] = useCurrentChatStore((state) => [state.chat])
  const [peer] = usePeerStore((state) => [state.peer])
  const [outcomingCallRef, setOutcomingCall, currentCall, setCurrentCall] = useMediaCallStore((state) => [
    state.outcomingCallRef,
    state.setOutcomingCall,
    state.currentCall,
    state.setCurrentCall,
  ])
  const [setLocalMediaStream, setRemoteMediaStream, setRemoteDeviceMuted, setLocalDeviceMuted] = useMediaStreamStore(
    (state) => [
      state.setLocalMediaStream,
      state.setRemoteMediaStream,
      state.setRemoteDeviceMuted,
      state.setLocalDeviceMuted,
    ]
  )
  const [contextAware, setContextAware, setShowClearConversationModal] = useAIChatStore((state) => [
    state.contextAware,
    state.setContextAware,
    state.setShowClearConversationModal,
  ])

  const chatName = chat.isAI ? 'My AI' : `${chat.users[0].firstName} ${chat.users[0].lastName}`
  const online = chat.isAI || chat.users.some((user) => isOnline(user._id))

  async function callUser(video: boolean, remotePeerId: string) {
    if (chat.isAI || currentCall || !peer || peer.disconnected) return

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

      // Callee answered the call
      call.on('stream', (remoteStream) => {
        setCurrentCall(call)
        setRemoteMediaStream(remoteStream)

        // if there was an error (network) causing the stream to be inactive, re-add track
        if (!stream.active) {
          stream.getTracks().forEach((track) => stream.removeTrack(track))
          addTrackToPeerConnection({ kind: 'audio', pc: call.peerConnection, stream, setLocalDeviceMuted })
          setLocalMediaStream(stream)
        }

        socket?.emit('dm', {
          type: 'DM_CALLER_CONNECTED',
          from: peer.id,
          to: call.peer,
        })
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
          <Avatar src={chat.isAI ? AIAvatar : chat.users[0].avatarUrl} alt={chatName} size={36} />

          {online && <div className="user-online-dot" aria-label="Online"></div>}
        </div>

        <p>{restrictLength(chatName, 50)}</p>
      </div>

      <div className="flex items-center gap-[24px]">
        {chat.isAI ? (
          <>
            <button
              id="clear-ai-conversation"
              className="chat__icon-btn"
              aria-label="Clear conversation"
              title="Clear conversation"
              onClick={() => setShowClearConversationModal((prev) => !prev)}
            >
              <TrashFill size={20} aria-hidden />
            </button>

            <Switch
              onChange={(checked) => setContextAware(checked)}
              checked={contextAware}
              onColor="#8b97d9"
              onHandleColor="#4158D0"
              offColor="#8B818A"
              handleDiameter={30}
              uncheckedIcon={false}
              checkedIcon={false}
              boxShadow="0 0 5px rgba(0, 0, 0, 0.6)"
              activeBoxShadow="0 0 1px 8px rgba(0, 0, 0, 0.2)"
              height={20}
              width={48}
              className="context-aware-switch"
            />
          </>
        ) : (
          <>
            <button
              className="chat__icon-btn"
              aria-label="Audio call"
              title={`Audio Call${!peer || peer.disconnected ? ' Not Available' : ''}`}
              onClick={() => callUser(false, chat.users[0]._id)}
              disabled={!peer || peer.disconnected}
            >
              <TelephoneFill size={20} aria-hidden />
            </button>

            <button
              className="chat__icon-btn"
              aria-label="Video call"
              title={`Video Call${!peer || peer.disconnected ? ' Not Available' : ''}`}
              onClick={() => callUser(true, chat.users[0]._id)}
              disabled={!peer || peer.disconnected}
            >
              <CameraVideoFill size={20} aria-hidden />
            </button>
          </>
        )}

        {/* <button className="chat__icon-btn" aria-label="Options">
          <ThreeDots size={20} aria-hidden />
        </button> */}
      </div>

      <Tooltip
        anchorSelect=".context-aware-switch"
        arrowColor="transparent"
        content="Context-aware AI - if enabled, AI will remember the context of the conversation and provide more accurate responses."
        offset={4}
        delayShow={1200}
        className="hidden sm:block max-w-[384px]"
      />
    </div>
  )
}

export default ChatTop
