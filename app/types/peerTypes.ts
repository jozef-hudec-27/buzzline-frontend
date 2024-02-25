import { Peer } from 'peerjs'

export type MyPeer = Peer | null

export type InitPeerFn = (peerId: string) => Promise<Peer>

export type KillPeerFn = () => void
