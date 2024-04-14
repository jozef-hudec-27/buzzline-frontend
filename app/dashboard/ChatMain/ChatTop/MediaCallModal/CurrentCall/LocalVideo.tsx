import { useState } from 'react'
import { WebcamFill } from 'react-bootstrap-icons'

import useMediaStreamStore from '@/app/zustand/webrtc/mediaStreamStore'

import { RefObject } from 'react'

function LocalVideo({ videoRef }: { videoRef: RefObject<HTMLVideoElement> }) {
  const localVideoMuted = useMediaStreamStore((state) => state.localVideoMuted)

  const [videoHidden, setVideoHidden] = useState(false)

  return (
    <button
      className={`absolute top-[16px] right-[16px] z-10 ${localVideoMuted && 'hidden'}`}
      onClick={() => setVideoHidden((prev) => !prev)}
      title={`${videoHidden ? 'Show' : 'Hide'} camera`}
    >
      <div className={`current-call__action bg-primary ${videoHidden ? 'block' : 'hidden'}`}>
        <WebcamFill className="text-white" size={20} />
      </div>

      <div className={`relative border-[2px] border-primary group rounded-[8px] ${videoHidden ? 'hidden' : 'block'}`}>
        <div className="w-full h-full absolute left-0 top-0 group-hover:bg-[rgb(0,0,0,0.6)] rounded-[6px]"></div>

        <p className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 hidden group-hover:inline text-white tracking-wide font-semibold uppercase">
          Hide
        </p>

        <video className={`h-[120px] sm:h-[180px] rounded-[6px]`} ref={videoRef} muted></video>
      </div>
    </button>
  )
}

export default LocalVideo
