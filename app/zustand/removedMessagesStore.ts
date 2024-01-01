import { create } from 'zustand'

type RemovedMessagesStore = {
  removedMessages: string[]
  addRemovedMessage: (messageId: string) => void
}

export default create<RemovedMessagesStore>()((set) => ({
  removedMessages: [],
  addRemovedMessage: (messageId) => set((state) => ({ removedMessages: [...state.removedMessages, messageId] })),
}))
