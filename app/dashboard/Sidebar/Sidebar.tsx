import { memo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { ChatFill, PeopleFill, BoxArrowRight, PersonBoundingBox } from 'react-bootstrap-icons'
import toast from 'react-hot-toast'

import useUserStore from '@/app/zustand/userStore'
import useChatsStore from '@/app/zustand/chatsStore'

import UpdateAvatarModal from './UpdateAvatarModal'

import api from '@/app/api/axiosInstance'

type SidebarProps = {
  leftPanel: 'chats' | 'people'
  setLeftPanel: React.Dispatch<React.SetStateAction<'chats' | 'people'>>
}

const Sidebar = memo(function ({ leftPanel, setLeftPanel }: SidebarProps) {
  const user = useUserStore((state) => state.user)
  const chats = useChatsStore((state) => state.chats)

  const [showUpdateAvatarModal, setShowUpdateAvatarModal] = useState(false)

  const router = useRouter()

  const activeClass = 'text-black-75 bg-black-5'

  const hasUnreadMessages = chats.some((chat) => chat.newestMessage && !chat.newestMessage.readBy.includes(user._id))

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api().post('/auth/logout')
    },
    onSuccess: () => {
      localStorage.removeItem('accessToken')
      router.replace('/login')
    },
    onError: () => {
      toast('Unable to log out.', { icon: '❌' })
    },
  })

  return (
    <div className="px-[12px] py-[16px] flex sm:flex-col items-center justify-between border-b sm:border-b-0 sm:border-r border-black-10">
      <div className="flex sm:flex-col items-center gap-[16px]">
        <button
          className={`relative p-[6px] rounded-[8px] hover:bg-black-5 ${
            leftPanel === 'chats' ? activeClass : 'text-black-50'
          }`}
          aria-label="Chats"
          onClick={() => setLeftPanel('chats')}
        >
          <ChatFill size={32} aria-hidden />

          {hasUnreadMessages && <div className="unread-messages-panel-dot" aria-label="Unread messages"></div>}
        </button>

        <button
          className={`p-[6px] rounded-[8px] hover:bg-black-5 ${leftPanel === 'people' ? activeClass : 'text-black-50'}`}
          aria-label="People"
          onClick={() => setLeftPanel('people')}
        >
          <PeopleFill size={32} aria-hidden />
        </button>

        <div
          className="w-[1px] sm:w-[32px] h-[32px] sm:h-[1px] bg-black-10 sm:mt-[16px] ml-[16px] sm:ml-0"
          aria-hidden
        ></div>
      </div>

      <div className="flex sm:flex-col items-center gap-[12px]">
        <button
          className='icon-btn'
          aria-label="Update avatar"
          onClick={() => {
            setShowUpdateAvatarModal(true)
          }}
        >
          <PersonBoundingBox size={24} aria-hidden />
        </button>

        <button
          className={`icon-btn ${logoutMutation.isPending && 'cursor-wait'}`}
          aria-label="Log out"
          onClick={() => {
            logoutMutation.mutate()
          }}
          disabled={logoutMutation.isPending || logoutMutation.isSuccess}
        >
          <BoxArrowRight size={24} aria-hidden />
        </button>
      </div>

      <UpdateAvatarModal isOpen={showUpdateAvatarModal} setIsOpen={setShowUpdateAvatarModal} />
    </div>
  )
})

export default Sidebar
