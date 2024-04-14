import { useShallow } from 'zustand/react/shallow'
import { Steps } from 'intro.js-react'

import useAIChatStore from '@/app/zustand/aiChatStore'
import useCurrentChatStore from '@/app/zustand/currentChatStore'

function AIChatGuide() {
  const [AIGuideShown, setAIGuideShown] = useAIChatStore(useShallow((state) => [state.guideShown, state.setGuideShown]))
  const chat = useCurrentChatStore((state) => state.chat)

  return (
    <Steps
      steps={[
        {
          intro: `<div class="flex flex-col gap-[24px]">
          <h4>👋 Welcome to My AI!</h4>
          <p>You need to know this before using My AI:</p>
          <ul class="list-disc list-inside">
              <li>It operates using generative AI technology. While safety measures have been incorporated into its design, please be aware that its responses may occasionally exhibit bias, inaccuracies, or even provide misleading or harmful information. It's advisable not to solely depend on its advice.</li>
              <li>Sharing sensitive or confidential information is not recommended.</li>
          </ul>
        </div>`,
        },
        {
          element: '#clear-ai-conversation',
          intro: `<div class="flex flex-col gap-[24px]">
            <h4>🗑️ Clearing the conversation</h4>
            <ul class="list-disc list-inside">
              <li>You can clear your conversation with My AI here. Keep in mind this action is irreversible and your messages will be deleted forever.</li>
              <li>In rare cases (most often due to bad input), My AI gets stuck and can't generate new responses. If this happens, clearing the conversation is your best bet.</li>
            </ul>
          </div>`,
        },
        {
          element: '.context-aware-switch',
          intro: `<div class="flex flex-col gap-[24px]">
            <h4>🤖 Context-aware AI</h4>
            <ul class="list-disc list-inside">
              <li>When enabled, My AI will remember the context of your conversation and provide more relevant responses.</li>
              <li>When disabled, My AI will not remember the context of your conversation.</li>
            </ul>
          </div>`,
        },
      ]}
      initialStep={0}
      onExit={() => setAIGuideShown(true)}
      ref={(steps) => {
        if (steps?.props?.options) {
          steps.props.options.doneLabel = 'Done'
          steps.props.options.hideNext = false
        }
      }}
      enabled={chat.isAI && !AIGuideShown}
    />
  )
}

export default AIChatGuide
