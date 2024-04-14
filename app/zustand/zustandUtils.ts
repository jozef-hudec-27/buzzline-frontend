import { StoreApi } from 'zustand'

// Used to create a setter mimicking useState
export const createSetter =
  <T, U>(key: keyof U, set: StoreApi<U>['setState'], cb?: () => any) =>
  (updater: ((prev: T) => T) | T) => {
    set((state) => {
      // @ts-ignore
      const updated = typeof updater === 'function' ? updater(state[key]) : updater
      return { [key]: updated } as Partial<U>
    })

    if (cb) cb()
  }
