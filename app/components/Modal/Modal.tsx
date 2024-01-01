import { PropsWithChildren } from 'react'
import ReactModal from 'react-modal'

export type ModalProps = PropsWithChildren<{
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  contentLabel?: string
}>

function Modal({ isOpen, setIsOpen, contentLabel, children }: ModalProps) {
  ReactModal.setAppElement('#root')

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={() => setIsOpen(false)}
      contentLabel={contentLabel}
      className="w-11/12 md:w-2/3 lg:w-1/2 fixed top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 p-[32px] bg-white drop-shadow-xl rounded-[24px]"
    >
      {children}
    </ReactModal>
  )
}

export default Modal
