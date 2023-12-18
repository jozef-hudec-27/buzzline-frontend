import Image from 'next/image'
import { ChatFill, PeopleFill } from 'react-bootstrap-icons'

type SidebarProps = {
  leftPanel: 'chats' | 'people'
  setLeftPanel: React.Dispatch<React.SetStateAction<'chats' | 'people'>>
}

function Sidebar({ leftPanel, setLeftPanel }: SidebarProps) {
  const activeClass = 'text-black-75 bg-black-5 p-[6px] rounded-[8px]'

  return (
    <div className="px-[12px] py-[16px] flex flex-col items-center justify-between border-r border-black-10">
      <div className="flex flex-col items-center gap-[16px]">
        <button
          className={`${leftPanel === 'chats' ? activeClass : 'text-black-50 p-[6px]'}`}
          aria-label="Chats"
          onClick={() => setLeftPanel('chats')}
        >
          <ChatFill size={32} aria-hidden />
        </button>

        <button
          className={`${leftPanel === 'people' ? activeClass : 'text-black-50 p-[6px]'}`}
          aria-label="People"
          onClick={() => setLeftPanel('people')}
        >
          <PeopleFill size={32} aria-hidden />
        </button>

        <div className="w-[32px] h-[1px] bg-black-10 mt-[16px]" aria-hidden></div>
      </div>

      <button aria-label="Settings">
        <Image
          src="https://faceboom.onrender.com/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBCZz09IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--e4a44a7bd0b470dc8d229be0daebaa1accc5deea/default-avatar.svg"
          alt="avatar"
          width={36}
          height={36}
          className="w-[36px] h-[36px] rounded-full"
        />
      </button>
    </div>
  )
}

export default Sidebar
