import { memo } from 'react'

import useOnlineUsersStore from '@/app/zustand/onlineUsersStore'
import useChatsStore from '@/app/zustand/chatsStore'

import Chat from '../ChatsPanel/Chat'

import { ChatIndex } from '@/app/types/globalTypes'

const PeoplePanel = memo(function () {
  const [chats, chatsLoading] = useChatsStore((state) => [state.chats, state.isLoading])
  const [isOnline] = useOnlineUsersStore((state) => [state.isOnline])

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

  const filteredChats = filterChats(chats)

  return (
    <div className="left-panel">
      <h3 className="hidden lg:block">People</h3>

      <p className="text-[13px] hidden sm:block">Active contacts</p>

      {!filteredChats.length && <p className="text-[12px] italic">No active contacts</p>}

      <div className="flex sm:flex-col overflow-auto">
        {chatsLoading && <p>Loading your chats...</p>}

        {filteredChats.map((chat) => (
          <Chat key={chat._id} chat={chat} hideNewestMessage />
        ))}
      </div>
    </div>
  )
})

export default PeoplePanel
