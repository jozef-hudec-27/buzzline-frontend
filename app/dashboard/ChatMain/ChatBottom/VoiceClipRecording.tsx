import { useState, useRef, useEffect } from 'react'
import { XCircleFill, PlayFill, StopFill, SendFill, PauseFill } from 'react-bootstrap-icons'

import useSocketStore from '@/app/zustand/socketStore'

import { Dispatch, SetStateAction, MutableRefObject } from 'react'
import { ChatShow } from '@/app/types'

type VoiceClipRecordingProps = {
  chat: ChatShow
  voiceClip: Blob | null
  setVoiceClip: Dispatch<SetStateAction<Blob | null>>
  recordingCancelled: MutableRefObject<boolean>
  stopRecording: () => void
}

function VoiceClipRecording({
  chat,
  voiceClip,
  setVoiceClip,
  recordingCancelled,
  stopRecording,
}: VoiceClipRecordingProps) {
  const socket = useSocketStore((state) => state.socket)

  const [finishedRecording, setFinishedRecording] = useState(false)
  const [previewPlaying, setPreviewPlaying] = useState(false)
  const previewAudio = useRef<HTMLAudioElement | null>(null)
  const timer = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const timerDiv = timer.current
    let timeInterval: NodeJS.Timeout

    if (voiceClip) {
      timeInterval = setInterval(() => {
        const audio = previewAudio.current

        if (!audio || !timerDiv) return

        const audioDuration = Number(audio?.dataset.duration)
        const currentTime = audio?.currentTime
        const difference = audioDuration - currentTime

        const minutes = Math.floor(difference / 60)
        const seconds = Math.floor(difference % 60)

        timerDiv.textContent = `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`
      }, 1000)
    } else {
      timeInterval = setInterval(() => {
        if (!timerDiv) return

        const time = timerDiv.textContent?.split(':')
        const minutes = Number(time?.[0])
        const seconds = Number(time?.[1])

        if (seconds < 59) {
          timerDiv.textContent = `${minutes}:${seconds + 1 < 10 ? `0${seconds + 1}` : seconds + 1}`
        } else {
          timerDiv.textContent = `${minutes + 1}:00`
        }
      }, 1000)
    }

    return () => {
      clearInterval(timeInterval)
    }
  }, [voiceClip])

  return (
    <>
      <button
        className="chat__icon-btn"
        aria-label="Cancel recording"
        onClick={() => {
          if (!finishedRecording) recordingCancelled.current = true
          setVoiceClip(null)
          setFinishedRecording(false)
          if (!finishedRecording) stopRecording()
        }}
      >
        <XCircleFill size={20} aria-hidden />
      </button>

      <div className="py-[12px] px-[24px] flex-1 flex items-center justify-between rounded-full bg-secondary">
        <button
          className="chat__icon-btn bg-white rounded-full"
          aria-label={
            finishedRecording ? (previewPlaying ? 'Pause voice clip' : 'Play my voice clip') : 'Finish recording'
          }
          onClick={() => {
            if (finishedRecording) {
              const audio = previewAudio.current as HTMLAudioElement

              if (previewPlaying) {
                audio?.pause()
                setPreviewPlaying(false)
              } else {
                audio?.play()
                setPreviewPlaying(true)
              }
            } else {
              setFinishedRecording(true)
              stopRecording()
            }
          }}
        >
          {finishedRecording ? (
            previewPlaying ? (
              <PauseFill size={20} aria-hidden />
            ) : (
              <PlayFill size={20} aria-hidden />
            )
          ) : (
            <StopFill size={20} aria-hidden />
          )}
        </button>

        <input type="text" className="bg-secondary w-0" tabIndex={-1} aria-hidden />

        <div className="bg-white text-secondary font-semibold px-[8px] rounded-full" ref={timer}>
          0:00
        </div>
      </div>

      <button
        className="chat__icon-btn"
        aria-label="Send voice clip"
        onClick={(e) => {
          const sendVoiceClipBtn = e.currentTarget

          if (finishedRecording) {
            setFinishedRecording(false)

            if (!voiceClip) return

            socket?.emit('message', { chat: chat._id, voiceClip })
            setVoiceClip(null)
          } else {
            setFinishedRecording(true)
            stopRecording()
            setTimeout(() => {
              sendVoiceClipBtn?.click()
            }, 100)
          }
        }}
      >
        <SendFill size={20} aria-hidden />
      </button>

      <audio
        id="voice-clip-preview"
        className="hidden"
        ref={previewAudio}
        onEnded={() => {
          setPreviewPlaying(false)

          const audio = previewAudio.current
          if (!audio) return
          audio.currentTime = 0
        }}
      ></audio>
    </>
  )
}

export default VoiceClipRecording
