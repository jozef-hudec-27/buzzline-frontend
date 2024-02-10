'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'

import useUserStore from './zustand/userStore'
import usePeerStore from './zustand/peerStore'
import useSocketStore from './zustand/socketStore'

function FetchUser() {
  const { fetchUser } = useUserStore((state) => ({ fetchUser: state.fetchUser }))
  const { setPeer, currentCall } = usePeerStore((state) => ({ setPeer: state.setPeer, currentCall: state.currentCall }))
  const socket = useSocketStore((state) => state.socket)

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
            if (currentCallRef.current) {
              incomingCall.close()
              socketRef.current?.emit('notification', {
                to: incomingCall.peer,
                type: 'NOTI_CALLEE_IN_CALL',
              })
            } else {
              toast(`Incoming call from ${incomingCall.peer}`, { icon: '📞' })
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
