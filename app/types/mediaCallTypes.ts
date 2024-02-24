import { MediaConnection } from 'peerjs'
import { MutableRefObject } from 'react'

export type MyCall = MediaConnection | null

export type CallRef = MutableRefObject<MyCall>

export type SetCallFn = (call: MyCall) => void
