import { Tooltip } from 'react-tooltip'

function ContextAwareAITooltip() {
  return (
    <Tooltip
      anchorSelect=".context-aware-switch"
      arrowColor="transparent"
      content="Context-aware AI - if enabled, AI will remember the context of the conversation and provide more accurate responses."
      offset={4}
      delayShow={1200}
      className="hidden sm:block max-w-[384px]"
    />
  )
}

export default ContextAwareAITooltip
