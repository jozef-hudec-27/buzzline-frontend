import { Search } from 'react-bootstrap-icons'
import { memo, useState } from 'react'

import useChatsStore from '../../zustand/chatsStore'

import Chat from './Chat'

import { ChatIndex } from '@/app/types'

const Chats = memo(function () {
  const { chats, isLoading: chatsLoading } = useChatsStore()

  const [search, setSearch] = useState('')

  function searchChats(c: ChatIndex[]): ChatIndex[] {
    const searchResult: ChatIndex[] = []

    c.forEach((chat) => {
      if (
        chat.users.some((user) => `${user.firstName}${user.lastName}}`.toLowerCase().includes(search.toLowerCase()))
      ) {
        searchResult.push(chat)
      }
    })

    return searchResult
  }

  return (
    <div className="px-[12px] py-[16px] w-[360px] flex flex-col gap-[22px] border-r border-black-10 h-[100vh]">
      <h3>Chats</h3>

      <div className="px-[24px] py-[12px] flex items-center gap-[10px] bg-black-5 rounded-full w-full">
        <Search size={16} className="text-black-25" />

        <input
          type="Search"
          placeholder="Search BuzzLine"
          className="text-black-75 placeholder:text-black-50 outline-none bg-black-5"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-col overflow-auto">
        {chatsLoading && <p>Loading your chats...</p>}

        {!chatsLoading && !chats.length && <p>You have no chats</p>}

        {searchChats(chats).map((chat) => (
          <Chat key={chat._id} chat={chat} />
        ))}
      </div>
    </div>
  )
})

export default Chats
