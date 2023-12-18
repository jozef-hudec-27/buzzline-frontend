import useChatsStore from '@/app/zustand/chatsStore'
import Chat from '../ChatsPanel/Chat'

import { ChatIndex } from '@/app/types'

function removeGroupChats(chats: ChatIndex[]): ChatIndex[] {
  return chats.filter((chat) => !chat.isGroup)
}

function PeoplePanel() {
  const chats = useChatsStore((state) => state.chats)
  const chatsLoading = useChatsStore((state) => state.isLoading)

  return (
    <div className="px-[12px] py-[16px] w-[360px] flex flex-col gap-[22px] border-r border-black-10 h-[100vh]">
      <h3>People</h3>

      <p className="text-[13px]">Active contacts</p>

      <div className="flex flex-col overflow-auto">
        {chatsLoading && <p>Loading your chats...</p>}

        {!chatsLoading && !chats.length && <p>You have no chats</p>}

        {removeGroupChats(chats).map((chat) => (
          <Chat key={chat._id} chat={chat} hideNewestMessage />
        ))}
      </div>
    </div>
  )
}

export default PeoplePanel
