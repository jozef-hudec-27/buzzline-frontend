import { Search } from 'react-bootstrap-icons'
import { memo } from 'react'

import useChatsStore from '../../zustand/chatsStore'

import Chat from './Chat'

const Chats = memo(function () {
  const { chats, isLoading: chatsLoading } = useChatsStore()

  return (
    <div className="px-[12px] py-[16px] w-[360px] flex flex-col gap-[22px] border-r border-black-10 h-[100vh]">
      <h3>Chats</h3>

      <div className="px-[24px] py-[12px] flex items-center gap-[10px] bg-black-5 rounded-full w-full">
        <Search size={16} className="text-black-25" />

        <input
          type="Search"
          placeholder="Search BuzzLine"
          className="text-black-75 placeholder:text-black-50 outline-none bg-black-5"
        />
      </div>

      <div className="flex flex-col overflow-auto">
        {chatsLoading && <p>Loading your chats...</p>}

        {!chatsLoading && !chats.length && <p>You have no chats</p>}

        {chats.map((chat) => (
          <Chat key={chat._id} chat={chat} />
        ))}
      </div>
    </div>
  )
})

export default Chats
