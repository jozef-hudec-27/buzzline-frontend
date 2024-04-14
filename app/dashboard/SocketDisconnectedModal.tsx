import { useState, useEffect } from 'react'

import useSocketStore from '../zustand/socketStore'
import useMediaCallStore from '../zustand/webrtc/mediaCallStore'

import Modal from '../components/Modal/Modal'

function SocketDisconnectedModal() {
  const socketDisconnected = useSocketStore((state) => state.socketDisconnected)
  const currentCall = useMediaCallStore((state) => state.currentCall)

  const [showReloadBtn, setShowReloadBtn] = useState(false)

  useEffect(() => {
    if (socketDisconnected) {
      const reloadTimeout = setTimeout(() => {
        setShowReloadBtn(true)
      }, 10000)

      return () => {
        clearTimeout(reloadTimeout)
      }
    }
  }, [socketDisconnected])

  return (
    <Modal isOpen={socketDisconnected && !currentCall} setIsOpen={function () {}}>
      <div className="flex flex-col items-center gap-[24px]">
        <span className="text-6xl">⚠️</span>

        <p className="text-4xl font-bold">Connection Error</p>

        <div>
          Trying to reconnect
          <span className="pulsing-dot">.</span>
          <span className="pulsing-dot">.</span>
          <span className="pulsing-dot">.</span>
        </div>

        {showReloadBtn && (
          <button className="btn btn--primary" onClick={() => window.location.reload()}>
            Reload page
          </button>
        )}
      </div>
    </Modal>
  )
}

export default SocketDisconnectedModal
