export type MyMediaStream = MediaStream | null

export type SetMediaStreamFn = (stream: MyMediaStream) => void

export type SetDeviceMutedFn = (device: MediaStreamTrack, muted: boolean) => void

export type MediaStreamTrack = 'audio' | 'video'
