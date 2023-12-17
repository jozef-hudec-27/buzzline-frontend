import Logo from "@/app/components/logo/Logo"

function ChatEmpty() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center gap-[48px]">
      <Logo cls="w-[128px] drop-shadow-md" />

      <h5>Select a chat to start messaging</h5>
    </div>
  )
}

export default ChatEmpty
