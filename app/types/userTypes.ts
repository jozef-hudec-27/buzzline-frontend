import { User } from './globalTypes'

export type SetUserFn = (user: User) => void

export type FetchUserFn = () => Promise<User>
