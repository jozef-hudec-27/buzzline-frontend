export type UserList = Set<string>

export type AddOnlineUserFn = (userId: string) => void

export type RemoveOnlineUserFn = (userId: string) => void

export type IsUserOnlineFn = (userId: string) => boolean
