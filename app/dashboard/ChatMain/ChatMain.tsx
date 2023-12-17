import useCurrentChatStore from '@/app/zustand/currentChatStore'
import ChatEmpty from './ChatEmpty'
import ChatTop from './ChatTop'

function ChatMain() {
  const chat = useCurrentChatStore((state) => state.chat)
  const chatLoading = useCurrentChatStore((state) => state.isLoading)

  if (!chatLoading && !Object.keys(chat).length) {
    return <ChatEmpty />
  } else if (chatLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Loading chat...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <ChatTop chat={chat} />

      <p>{chat.users[0].firstName}</p>
    </div>
  )
}

export default ChatMain
