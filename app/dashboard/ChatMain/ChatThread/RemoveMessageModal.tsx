import { memo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import useSocketStore from '@/app/zustand/socketStore'
import useCurrentChatMessagesStore from '@/app/zustand/currentChatMessagesStore'
import useChatsStore from '@/app/zustand/chatsStore'

import Modal from '@/app/components/Modal/Modal'
import ActionModal from '@/app/components/Modal/ActionModal'

import { MessageToRemove } from '@/app/types/chatMessagesTypes'

const RemoveMessageModal = memo(function () {
  const socket = useSocketStore((state) => state.socket)
  const [messageToRemove, setMessageToRemove, messages] = useCurrentChatMessagesStore(
    useShallow((state) => [state.messageToRemove, state.setMessageToRemove, state.messages])
  )
  const updateChats = useChatsStore((state) => state.updateChats)

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

    updateChats(
      removedMessage?.chat || '',
      (chat) => {
        const { newestMessage, ...chatWithoutNewestMessage } = chat

        if (newestMessage) {
          newestMessage.isRemoved = true
          newestMessage.content = ''
          newestMessage.voiceClipUrl = undefined
          newestMessage.imageUrl = undefined
        }

        return { ...chatWithoutNewestMessage, newestMessage }
      },
      'replace'
    )
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
})

export default RemoveMessageModal
