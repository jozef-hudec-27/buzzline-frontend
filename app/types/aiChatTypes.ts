export type SetContextAwareFn = (aware: boolean) => void

type SetShowClearConversationUpdaterFn = (prevShow: boolean) => boolean

export type SetShowClearConversationModalFn = (updater: SetShowClearConversationUpdaterFn | boolean) => void
