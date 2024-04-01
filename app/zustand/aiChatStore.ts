import { create } from 'zustand'

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
  setShowClearConversationModal: (updater) =>
    set((state) => {
      if (typeof updater === 'function') {
        return { showClearConversationModal: updater(state.showClearConversationModal) }
      } else {
        return { showClearConversationModal: updater }
      }
    }),
}))
