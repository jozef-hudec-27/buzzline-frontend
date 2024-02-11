'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'

import useUserStore from './zustand/userStore'
import usePeerStore from './zustand/peerStore'
import useSocketStore from './zustand/socketStore'
import useMediaCallStore from './zustand/mediaCallStore'

function FetchUser() {
  const { fetchUser } = useUserStore((state) => ({ fetchUser: state.fetchUser }))
  const setPeer = usePeerStore((state) => state.setPeer)
  const socket = useSocketStore((state) => state.socket)
  const { setIncomingCall, setCurrentCall, currentCall } = useMediaCallStore((state) => ({
    setIncomingCall: state.setIncomingCall,
    setCurrentCall: state.setCurrentCall,
    currentCall: state.currentCall,
  }))

  const currentCallRef = useRef(currentCall)
  const socketRef = useRef(socket)

  useEffect(() => {
    currentCallRef.current = currentCall
    socketRef.current = socket
  }, [currentCall, socket])

  useEffect(() => {
    const fn = async () => {
      // Importing PeerJs dynamically to avoid SSR issues
      const PeerJs = (await import('peerjs')).default

      try {
        const userFetched = await fetchUser()
        const newPeer = new PeerJs(userFetched._id)

        newPeer.on('open', () => {
          newPeer.on('call', (incomingCall) => {
            incomingCall.on('close', () => {
              setCurrentCall(null)
            })

            if (currentCallRef.current) {
              socketRef.current?.emit('notification', {
                to: incomingCall.peer,
                type: 'NOTI_CALLEE_IN_CALL',
              })
            } else {
              setIncomingCall(incomingCall)
            }
          })
        })

        setPeer(newPeer)
      } catch {}
    }

    fn()
  }, [])

  return <></>
}

export default FetchUser
