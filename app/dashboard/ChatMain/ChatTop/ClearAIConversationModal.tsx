import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'

import useAIChatStore from '@/app/zustand/aiChatStore'
import useCurrentChatMessagesStore from '@/app/zustand/currentChatMessagesStore'
import useChatsStore from '@/app/zustand/chatsStore'

import Modal from '@/app/components/Modal/Modal'
import api from '@/app/api/axiosInstance'

function ClearAIConversationModal() {
  const [showClearConversationModal, setShowClearConversationModal] = useAIChatStore((state) => [
    state.showClearConversationModal,
    state.setShowClearConversationModal,
  ])
  const [setMessages] = useCurrentChatMessagesStore((state) => [state.setMessages])
  const [setChats] = useChatsStore((state) => [state.setChats])

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

      setMessages(() => [])
      setChats((prevChats) => {
        // Update chats panel
        const chat = prevChats.find((chat) => chat._id === chatId)

        if (!chat) return prevChats

        const { newestMessage, ...chatWithoutNewestMessage } = chat

        return prevChats.map((c) => (c._id === chatId ? chatWithoutNewestMessage : c))
      })
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
      <div>
        <div className="flex flex-col gap-[12px]">
          <h3>Do you really want to clear your conversation with My AI?</h3>

          <p>This cannot be undone.</p>

          <div className="flex flex-col sm:flex-row gap-[8px] mt-[12px]">
            <button
              className={`btn btn--primary flex-1 ${clearConversationMutation.isPending ? 'cursor-wait' : ''}`}
              onClick={() => {
                clearConversationMutation.mutate()
              }}
              disabled={clearConversationMutation.isPending}
            >
              Yes, clear conversation
            </button>
            <button
              className="btn btn--primary !bg-transparent !text-black-100 flex-1"
              onClick={() => setShowClearConversationModal(false)}
              disabled={clearConversationMutation.isPending}
            >
              No, take me back
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default ClearAIConversationModal
