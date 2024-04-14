import { useMutation } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

import useChatsStore from '@/app/zustand/chatsStore'

import Modal, { ModalProps } from '@/app/components/Modal/Modal'
import api from '@/app/api/axiosInstance'

import { AxiosError } from 'axios'
import { ChatIndex } from '@/app/types/globalTypes'

function NewChatModal({ isOpen, setIsOpen }: ModalProps) {
  const setChats = useChatsStore((state) => state.setChats)

  const [chatToken, setChatToken] = useState('')

  const newChatMutation = useMutation({
    mutationFn: async (chatToken: string) => {
      return await api(true).post('/api/chats', { chatToken })
    },
    onError: (e: AxiosError) => {
      const res = e.response?.data as { errors: { msg: string }[]; message: string }

      if (res?.errors) {
        toast(res?.errors[0].msg, { icon: '❌' })
      } else if (res?.message) {
        toast(res?.message, { icon: '❌' })
      } else {
        toast('Something went wrong.', { icon: '❌' })
      }
    },
    onSuccess: (data) => {
      const newChat = data.data as ChatIndex
      setChats((prevChats) => [...prevChats, newChat])
      setIsOpen(false)
    },
  })

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()

    newChatMutation.mutate(chatToken)
  }

  useEffect(() => {
    setChatToken('')
  }, [isOpen])

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} contentLabel="New chat modal">
      <div className="flex flex-col gap-[32px] items-center">
        <h2>New Chat</h2>

        <form className="flex flex-col sm:flex-row items-center gap-[16px]" onSubmit={onSubmit}>
          <input
            type="text"
            className="input w-full"
            placeholder="Chat token"
            aria-label="Chat token"
            value={chatToken}
            onChange={(e) => setChatToken(e.target.value)}
            required
          />

          <button
            className={`btn btn--primary ${newChatMutation.isPending ? 'cursor-wait' : ''}`}
            disabled={!chatToken || newChatMutation.isPending}
          >
            Submit
          </button>
        </form>
      </div>
    </Modal>
  )
}

export default NewChatModal
