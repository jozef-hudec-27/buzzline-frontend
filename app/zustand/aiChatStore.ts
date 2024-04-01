import { create } from 'zustand'

import { createSetter } from './zustandUtils'

import { SetContextAwareFn, SetShowClearConversationModalFn } from '../types/aiChatTypes'

type AIChatStore = {
  contextAware: boolean
  setContextAware: SetContextAwareFn
  showClearConversationModal: boolean
  setShowClearConversationModal: SetShowClearConversationModalFn
}

export default create<AIChatStore>()((set) => ({
  contextAware: !!window.localStorage.getItem('AIChatContextAware'),
  setContextAware: (aware) => {
    set(() => ({ contextAware: aware }))

    if (!aware) {
      window.localStorage.removeItem('AIChatContextAware')
    } else {
      window.localStorage.setItem('AIChatContextAware', 'true')
    }
  },
  showClearConversationModal: false,
  setShowClearConversationModal: createSetter<boolean, AIChatStore>('showClearConversationModal', set),
}))
