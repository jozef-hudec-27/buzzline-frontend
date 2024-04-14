import { useShallow } from 'zustand/react/shallow'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'

import useAIChatStore from '@/app/zustand/aiChatStore'
import useCurrentChatMessagesStore from '@/app/zustand/currentChatMessagesStore'
import useChatsStore from '@/app/zustand/chatsStore'

import Modal from '@/app/components/Modal/Modal'
import ActionModal from '@/app/components/Modal/ActionModal'
import api from '@/app/api/axiosInstance'

function ClearAIConversationModal() {
  const [showClearConversationModal, setShowClearConversationModal] = useAIChatStore(
    useShallow((state) => [state.showClearConversationModal, state.setShowClearConversationModal])
  )
  const setMessages = useCurrentChatMessagesStore((state) => state.setMessages)
  const updateChats = useChatsStore((state) => state.updateChats)

  const clearConversationMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api(true).post('/api/me/clear-ai-conversation')

      return data
    },
    onError: () => {
      toast('Something went wrong. Please try again later.', { icon: '❌' })
      setShowClearConversationModal(false)
    },
    onSuccess: (data) => {
      const { chatId } = data

      setMessages([])
      updateChats(chatId, (chat) => ({ ...chat, newestMessage: undefined }), 'replace')
      setShowClearConversationModal(false)
    },
  })

  return (
    <Modal
      isOpen={showClearConversationModal}
      setIsOpen={(open: boolean) => {
        if (clearConversationMutation.isPending) return

        setShowClearConversationModal(open)
      }}
      contentLabel="Clear AI conversation modal"
    >
      <ActionModal
        title="Do you really want to clear your conversation with My AI?"
        subtitle="This cannot be undone."
        confirmText="Yes, clear conversation"
        confirmAction={clearConversationMutation.mutate}
        cancelText="No, take me back"
        cancelAction={() => setShowClearConversationModal(false)}
        actionPending={clearConversationMutation.isPending}
      />
    </Modal>
  )
}

export default ClearAIConversationModal
