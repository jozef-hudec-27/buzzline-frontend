import useSocketStore from '@/app/zustand/socketStore'
import useCurrentChatMessagesStore from '@/app/zustand/currentChatMessagesStore'

import Modal from '@/app/components/Modal/Modal'

function RemoveMessageModal() {
  const [socket] = useSocketStore((state) => [state.socket])
  const [messageToRemove, setMessageToRemove] = useCurrentChatMessagesStore((state) => [
    state.messageToRemove,
    state.setMessageToRemove,
  ])

  function setIsOpen(open: boolean) {
    if (open) return

    setMessageToRemove(null)
  }

  return (
    messageToRemove && (
      <Modal isOpen={!!messageToRemove} setIsOpen={setIsOpen} contentLabel="Remove message modal">
        <div>
          <div className="flex flex-col gap-[12px]">
            <h3>Do you really want to remove this message?</h3>

            <p>This action is irreversible.</p>

            <div className="flex flex-col sm:flex-row gap-[8px] mt-[12px]">
              <button
                className="btn btn--primary flex-1"
                onClick={() => {
                  socket?.emit('messageRemove', { chat: messageToRemove.chat, messageId: messageToRemove._id })
                  setMessageToRemove(null)
                }}
              >
                Yes, remove
              </button>
              <button
                className="btn btn--primary !bg-transparent !text-black-100 flex-1"
                onClick={() => setMessageToRemove(null)}
              >
                No, take me back
              </button>
            </div>
          </div>
        </div>
      </Modal>
    )
  )
}

export default RemoveMessageModal
