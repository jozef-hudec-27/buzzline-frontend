import { memo } from 'react'

import useOnlineUsersStore from '@/app/zustand/onlineUsersStore'
import useChatsStore from '@/app/zustand/chatsStore'

import Chat from '../ChatsPanel/Chat'

import { ChatIndex } from '@/app/types'

const PeoplePanel = memo(function () {
  const { chats, isLoading: chatsLoading } = useChatsStore()
  const { isOnline } = useOnlineUsersStore()

  function removeGroupChats(chats: ChatIndex[]): ChatIndex[] {
    return chats.filter((chat) => !chat.isGroup)
  }

  function removeOfflineChats(chats: ChatIndex[]): ChatIndex[] {
    const filtered: ChatIndex[] = []

    chats.forEach((chat) => {
      if (chat.users.some((user) => isOnline(user._id))) {
        filtered.push(chat)
      }
    })

    return filtered
  }

  function filterChats(chats: ChatIndex[]): ChatIndex[] {
    return removeOfflineChats(removeGroupChats(chats))
  }

  return (
    <div className="left-panel">
      <h3 className='hidden lg:block'>People</h3>

      <p className="text-[13px]">Active contacts</p>

      <div className="flex flex-col overflow-auto">
        {chatsLoading && <p>Loading your chats...</p>}

        {!chatsLoading && !chats.length && <p>You have no chats</p>}

        {filterChats(chats).map((chat) => (
          <Chat key={chat._id} chat={chat} hideNewestMessage />
        ))}
      </div>
    </div>
  )
})

export default PeoplePanel
