import Image from 'next/image'

import { Search } from 'react-bootstrap-icons'

import useChatsStore from '../zustand/chatsStore'

function Chats() {
  const chats = useChatsStore((state) => state.chats)
  const chatsLoading = useChatsStore((state) => state.isLoading)

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

        {chats.map((chat) => (
          <div
            key={chat._id}
            className="p-[6px] flex items-center gap-[10px] rounded-[8px] hover:bg-black-5 cursor-pointer"
          >
            <Image
              src="https://faceboom.onrender.com/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBCZz09IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--e4a44a7bd0b470dc8d229be0daebaa1accc5deea/default-avatar.svg"
              alt="avatar"
              width={48}
              height={48}
              className="w-[48px] h-[48px] rounded-full"
            />

            <div className="flex flex-col">
              <p>
                {chat.users[0].firstName} {chat.users[0].lastName}
              </p>

              {chat.newestMessage && <p className="font-[13px] text-black-65">{chat.newestMessage.content}</p>}
            </div>
          </div>
        )) || <p>You have no chats</p>}
      </div>
    </div>
  )
}

export default Chats
