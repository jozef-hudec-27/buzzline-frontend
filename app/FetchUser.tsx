'use client'

import { useEffect } from 'react'

import useUserStore from './zustand/userStore'
import usePeerStore from './zustand/peerStore'
import useMediaCallStore from './zustand/mediaCallStore'
import useSocketStore from './zustand/socketStore'

import useStef from './hooks/useStef'
import { handleIncomingCall } from './mediaCallUtils'

function FetchUser() {
  const [fetchUser] = useUserStore((state) => [state.fetchUser])
  const [initPeer] = usePeerStore((state) => [state.initPeer])
  const [setCurrentCall, currentCall, setLocalMediaStream, setRemoteMediaStream, setIncomingCall] = useMediaCallStore(
    (state) => [
      state.setCurrentCall,
      state.currentCall,
      state.setLocalMediaStream,
      state.setRemoteMediaStream,
      state.setIncomingCall,
    ]
  )
  const [socket] = useSocketStore((state) => [state.socket])

  const currentCallStef = useStef(currentCall)
  const socketStef = useStef(socket)

  useEffect(() => {
    const fn = async () => {
      try {
        const user = await fetchUser()
        const peer = await initPeer(user._id)

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
      } catch (e){
        console.log(e)
      }
    }

    fn()
  }, [])

  return <></>
}

export default FetchUser
