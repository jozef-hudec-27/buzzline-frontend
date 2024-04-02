import useSocketStore from '@/app/zustand/socketStore'
import useCurrentChatMessagesStore from '@/app/zustand/currentChatMessagesStore'
import useChatsStore from '@/app/zustand/chatsStore'

import Modal from '@/app/components/Modal/Modal'
import ActionModal from '@/app/components/Modal/ActionModal'

import { MessageToRemove } from '@/app/types/chatMessagesTypes'

function RemoveMessageModal() {
  const [socket] = useSocketStore((state) => [state.socket])
  const [messageToRemove, setMessageToRemove, messages] = useCurrentChatMessagesStore((state) => [
    state.messageToRemove,
    state.setMessageToRemove,
    state.messages,
  ])
  const [setChats] = useChatsStore((state) => [state.setChats])

  function setIsOpen(open: boolean) {
    if (open) return

    setMessageToRemove(null)
  }

  function removeMessage() {
    if (!messageToRemove) return

    socket?.emit('messageRemove', { chat: messageToRemove.chat, messageId: messageToRemove._id })
    setMessageToRemove(null)
  }

  function updateChatsPanel(removedMessage: MessageToRemove) {
    if (messages[messages.length - 1] && messages[messages.length - 1]._id !== removedMessage?._id) return

    setChats((prevChats) => {
      const chat = prevChats.find((c) => c._id === removedMessage?.chat)

      if (!chat) return prevChats

      const { newestMessage, ...chatWithoutNewestMessage } = chat
      if (newestMessage) {
        newestMessage.isRemoved = true
        newestMessage.content = ''
        newestMessage.voiceClipUrl = undefined
        newestMessage.imageUrl = undefined
      }

      const newChat = { ...chatWithoutNewestMessage, newestMessage }

      return prevChats.map((c) => (c._id === removedMessage?.chat ? newChat : c))
    })
  }

  return (
    messageToRemove && (
      <Modal isOpen={!!messageToRemove} setIsOpen={setIsOpen} contentLabel="Remove message modal">
        <ActionModal
          title="Do you really want to remove this message?"
          subtitle="This action is irreversible."
          confirmText="Yes, remove"
          confirmAction={() => {
            removeMessage()
            updateChatsPanel(messageToRemove)
          }}
          cancelText="No, take me back"
          cancelAction={() => setMessageToRemove(null)}
        />
      </Modal>
    )
  )
}

export default RemoveMessageModal
