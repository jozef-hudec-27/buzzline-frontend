'use client'

import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'

import useUserStore from './zustand/userStore'
import useSocketStore from './zustand/socketStore'
import usePeerStore from './zustand/webrtc/peerStore'
import useMediaCallStore from './zustand/webrtc/mediaCallStore'
import useMediaStreamStore from './zustand/webrtc/mediaStreamStore'

import { configurePeer } from './utils/peerUtils'

function FetchUser() {
  const fetchUser = useUserStore((state) => state.fetchUser)
  const [initPeer, killPeer] = usePeerStore(useShallow((state) => [state.initPeer, state.killPeer]))
  const socketRef = useSocketStore((state) => state.socketRef)
  const [setCurrentCall, currentCallRef, setIncomingCall, incomingCallRef, setOutcomingCall, outcomingCallRef] =
    useMediaCallStore(
      useShallow((state) => [
        state.setCurrentCall,
        state.currentCallRef,
        state.setIncomingCall,
        state.incomingCallRef,
        state.setOutcomingCall,
        state.outcomingCallRef,
      ])
    )
  const [setLocalMediaStream, setRemoteMediaStream] = useMediaStreamStore(
    useShallow((state) => [state.setLocalMediaStream, state.setRemoteMediaStream])
  )

  useEffect(() => {
    const fn = async () => {
      try {
        const user = await fetchUser()
        const peer = await initPeer(user._id)

        configurePeer({
          peer,
          killPeer,
          userId: user._id,
          socketRef,
          currentCallRef,
          setCurrentCall,
          setLocalMediaStream,
          setRemoteMediaStream,
          incomingCallRef,
          setIncomingCall,
          outcomingCallRef,
          setOutcomingCall,
        })
      } catch (e) {}
    }

    fn()
  }, [])

  return <></>
}

export default FetchUser
