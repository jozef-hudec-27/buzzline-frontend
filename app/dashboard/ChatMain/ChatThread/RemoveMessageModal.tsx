import useSocketStore from '@/app/zustand/socketStore'

import Modal, { ModalProps } from '@/app/components/Modal/Modal'

import { Message } from '@/app/types'

type RemoveMessageModalProps = ModalProps & {
  message: Message
}

function RemoveMessageModal({ isOpen, setIsOpen, message }: RemoveMessageModalProps) {
  const [socket] = useSocketStore((state) => [state.socket])

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} contentLabel="Remove message modal">
      <div>
        <div className="flex flex-col gap-[12px]">
          <h3>Do you really want to remove this message?</h3>

          <p>This action is irreversible.</p>

          <div className="flex flex-col sm:flex-row gap-[8px] mt-[12px]">
            <button
              className="btn btn--primary flex-1"
              onClick={() => {
                socket?.emit('messageRemove', { chat: message.chat, messageId: message._id })
                setIsOpen(false)
              }}
            >
              Yes, remove
            </button>
            <button
              className="btn btn--primary !bg-transparent !text-black-100 flex-1"
              onClick={() => setIsOpen(false)}
            >
              No, take me back
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default RemoveMessageModal
