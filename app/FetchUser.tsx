'use client'

import { useEffect } from 'react'

import useUserStore from './zustand/userStore'
import usePeerStore from './zustand/peerStore'
import useMediaCallStore from './zustand/mediaCallStore'
import useSocketStore from './zustand/socketStore'

import { configurePeer } from './utils/peerUtils'

function FetchUser() {
  const [fetchUser] = useUserStore((state) => [state.fetchUser])
  const [initPeer] = usePeerStore((state) => [state.initPeer])
  const [
    setCurrentCall,
    currentCallRef,
    setLocalMediaStream,
    setRemoteMediaStream,
    setIncomingCall,
    incomingCallRef,
    setOutcomingCall,
    outcomingCallRef,
  ] = useMediaCallStore((state) => [
    state.setCurrentCall,
    state.currentCallRef,
    state.setLocalMediaStream,
    state.setRemoteMediaStream,
    state.setIncomingCall,
    state.incomingCallRef,
    state.setOutcomingCall,
    state.outcomingCallRef,
  ])
  const [socketRef] = useSocketStore((state) => [state.socketRef])

  useEffect(() => {
    const fn = async () => {
      try {
        const user = await fetchUser()
        const peer = await initPeer(user._id)

        configurePeer({
          peer,
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
      } catch (e) {
        console.log(e)
      }
    }

    fn()
  }, [])

  return <></>
}

export default FetchUser
