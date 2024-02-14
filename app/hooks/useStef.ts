// Stef is a mix of useState and useRef: it returns the current state and updates the state without re-rendering the component

import { useRef, useEffect } from 'react'

const useStef = <T>(state: T) => {
  const stateRef = useRef<T>(state)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  return stateRef
}

export default useStef
