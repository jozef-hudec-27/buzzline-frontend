import Switch from 'react-switch'

import useAIChatStore from '@/app/zustand/aiChatStore'

function ContextAwareAISwitch() {
  const [contextAware, setContextAware] = useAIChatStore((state) => [state.contextAware, state.setContextAware])

  return (
    <Switch
      onChange={(checked) => setContextAware(checked)}
      checked={contextAware}
      onColor="#8b97d9"
      onHandleColor="#4158D0"
      offColor="#8B818A"
      handleDiameter={30}
      uncheckedIcon={false}
      checkedIcon={false}
      boxShadow="0 0 5px rgba(0, 0, 0, 0.6)"
      activeBoxShadow="0 0 1px 8px rgba(0, 0, 0, 0.2)"
      height={20}
      width={48}
      className="context-aware-switch"
    />
  )
}

export default ContextAwareAISwitch
