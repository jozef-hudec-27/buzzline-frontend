import { create } from 'zustand'

import { Call } from '@/app/types'
import { MutableRefObject } from 'react'

type SetCallFn = (call: Call) => void

type MediaCallStore = {
  incomingCall: Call
  setIncomingCall: SetCallFn
  incomingCallRef: MutableRefObject<Call>

  outcomingCall: Call
  setOutcomingCall: SetCallFn
  outcomingCallRef: MutableRefObject<Call>

  currentCall: Call
  setCurrentCall: SetCallFn
  currentCallRef: MutableRefObject<Call>
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
