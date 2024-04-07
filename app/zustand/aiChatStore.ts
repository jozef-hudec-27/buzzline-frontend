import { create } from 'zustand'

import { createSetter } from './zustandUtils'

import { SetContextAwareFn, SetShowClearConversationModalFn, SetGuideShownFn } from '../types/aiChatTypes'

type AIChatStore = {
  contextAware: boolean
  setContextAware: SetContextAwareFn
  showClearConversationModal: boolean
  setShowClearConversationModal: SetShowClearConversationModalFn
  guideShown: boolean
  setGuideShown: SetGuideShownFn
}

export default create<AIChatStore>()((set) => ({
  contextAware: typeof window === 'undefined' ? false : !!window.localStorage.getItem('AIChatContextAware'),
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
  guideShown: typeof window === 'undefined' ? false : !!window.localStorage.getItem('AIChatGuideShown'),
  setGuideShown: (show) => {
    set(() => ({ guideShown: show }))

    if (show) {
      window.localStorage.setItem('AIChatGuideShown', 'true')
    } else {
      window.localStorage.removeItem('AIChatGuideShown')
    }
  },
}))
