import { Socket } from 'socket.io-client'
import { MutableRefObject } from 'react'

export type MySocket = Socket | null

export type SetSocketFn = (socket: Socket) => void

export type SocketRef = MutableRefObject<MySocket>

export type SetSocketDisconnectedFn = (disconnected: boolean) => void
