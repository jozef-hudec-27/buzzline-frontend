'use client'

import { useEffect } from 'react'

import useUserStore from './zustand/userStore'
import usePeerStore from './zustand/peerStore'
import useMediaCallStore from './zustand/mediaCallStore'
import useSocketStore from './zustand/socketStore'

import useStef from './hooks/useStef'
import { handleIncomingCall, closeOutcomingCall } from './mediaCallUtils'

function FetchUser() {
  const [fetchUser] = useUserStore((state) => [state.fetchUser])
  const [initPeer] = usePeerStore((state) => [state.initPeer])
  const [
    setCurrentCall,
    currentCall,
    setLocalMediaStream,
    setRemoteMediaStream,
    setIncomingCall,
    setOutcomingCall,
    outcomingCall,
  ] = useMediaCallStore((state) => [
    state.setCurrentCall,
    state.currentCall,
    state.setLocalMediaStream,
    state.setRemoteMediaStream,
    state.setIncomingCall,
    state.setOutcomingCall,
    state.outcomingCall,
  ])
  const [socket] = useSocketStore((state) => [state.socket])

  const currentCallStef = useStef(currentCall)
    const socketStef = useStef(socket)
    const outcomingCallStef = useStef(outcomingCall)

  useEffect(() => {
    const fn = async () => {
      try {
        const user = await fetchUser()
        const peer = await initPeer(user._id)

        peer.on('disconnected', () => {
          if (!outcomingCallStef.current) return
          closeOutcomingCall({
            paramsType: 'ref',
            userId: user._id,
            socketStef,
            outcomingCallStef,
            setOutcomingCall,
            setLocalMediaStream,
          })
        })

        peer.on('open', () =>
          handleIncomingCall(
            peer,
            socketStef,
            currentCallStef,
            setCurrentCall,
            setLocalMediaStream,
            setRemoteMediaStream,
            setIncomingCall
          )
        )
      } catch (e) {
        console.log(e)
      }
    }

    fn()
  }, [])

  return <></>
}

export default FetchUser
