import { create } from 'zustand'

import { MyCall, CallRef, SetCallFn } from '@/app/types/mediaCallTypes'

type MediaCallStore = {
  incomingCall: MyCall
  setIncomingCall: SetCallFn
  incomingCallRef: CallRef

  outcomingCall: MyCall
  setOutcomingCall: SetCallFn
  outcomingCallRef: CallRef

  currentCall: MyCall
  setCurrentCall: SetCallFn
  currentCallRef: CallRef
}

export default create<MediaCallStore>((set, get) => ({
  incomingCall: null,
  setIncomingCall: (call) => {
    set({ incomingCall: call })
    get().incomingCallRef.current = call
  },
  incomingCallRef: { current: null },

  outcomingCall: null,
  setOutcomingCall: (call) => {
    set({ outcomingCall: call })
    get().outcomingCallRef.current = call
  },
  outcomingCallRef: { current: null },

  currentCall: null,
  setCurrentCall: (call) => {
    get().currentCallRef.current = call

    if (call) {
      set({ currentCall: call })
      get().setIncomingCall(null)
      get().setOutcomingCall(null)
    } else {
      set({ currentCall: call })
    }
  },
  currentCallRef: { current: null },
}))
