import Modal from 'react-modal'

import useSocketStore from '@/app/zustand/socketStore'

import { Message } from '@/app/types'

type RemoveMessageModalProps = {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  message: Message
}

function RemoveMessageModal({ isOpen, setIsOpen, message }: RemoveMessageModalProps) {
  const socket = useSocketStore((state) => state.socket)

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => setIsOpen(false)}
      contentLabel="Remove message modal"
      className="w-11/12 md:w-2/3 lg:w-1/2 fixed top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 p-[32px] bg-white drop-shadow-xl rounded-[24px]"
    >
      <div>
        <div className="flex flex-col gap-[12px]">
          <h3>Do you really want to remove this message?</h3>

          <p>This action is irreversible.</p>

          <div className="flex flex-col sm:flex-row gap-[8px] mt-[12px]">
            <button
              className="btn primary flex-1"
              onClick={() => {
                socket?.emit('messageRemove', { chat: message.chat, messageId: message._id })
                setIsOpen(false)
              }}
            >
              Yes, remove
            </button>
            <button className="btn primary !bg-transparent !text-black-100 flex-1" onClick={() => setIsOpen(false)}>
              No, take me back
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default RemoveMessageModal
