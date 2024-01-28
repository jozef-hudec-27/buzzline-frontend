import { useState } from 'react'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { Popover } from 'react-tiny-popover'
import { EmojiSmileFill } from 'react-bootstrap-icons'

type EmojiButtonProps = {
  setMessage: React.Dispatch<React.SetStateAction<string>>
}

function EmojiButton({ setMessage }: EmojiButtonProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  return (
    <Popover
      isOpen={showEmojiPicker}
      positions={['left', 'top', 'bottom']}
      align="end"
      padding={8}
      onClickOutside={() => setShowEmojiPicker(false)}
      content={
        <Picker
          data={data}
          onEmojiSelect={(emoji: any) => setMessage((prev) => prev + emoji.native)}
          previewPosition="none"
          searchPosition="none"
          navPosition="none"
          theme="light"
          categories={['people']}
        />
      }
    >
      <button
        type="button"
        className="chat-icon relative"
        aria-label="Choose an emoji"
        title="Choose an emoji"
        onClick={() => setShowEmojiPicker((prev) => !prev)}
      >
        <EmojiSmileFill size={20} aria-hidden />
      </button>
    </Popover>
  )
}

export default EmojiButton
