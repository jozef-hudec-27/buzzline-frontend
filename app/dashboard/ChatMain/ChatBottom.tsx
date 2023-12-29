'use client'

import { useRef, useState, useEffect } from 'react'
import {
  MicFill,
  Image,
  HandThumbsUpFill,
  EmojiSmileFill,
  XCircleFill,
  SendFill,
  StopFill,
  PlayFill,
} from 'react-bootstrap-icons'
import useSocketStore from '@/app/zustand/socketStore'
import toast from 'react-hot-toast'

import { ChatShow } from '@/app/types'

function ChatBottom({ chat }: { chat: ChatShow }) {
  const socket = useSocketStore((state) => state.socket)

  const [message, setMessage] = useState('')

  const [isRecordingVoiceClip, setIsRecordingVoiceClip] = useState(false)
  const recordingCancelled = useRef(false)
  const [finishedRecording, setFinishedRecording] = useState(false)
  const [voiceClip, setVoiceClip] = useState<Blob | null>(null)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const recordedChunks = useRef<Blob[]>([])

  useEffect(() => {
    const audio = document.getElementById('voice-clip-preview') as HTMLAudioElement

    if (voiceClip && audio) {
      audio.src = URL.createObjectURL(voiceClip)
    } else if (audio) {
      audio.src = ''
    }
  }, [voiceClip])

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder.current = new MediaRecorder(stream)
    mediaRecorder.current.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunks.current.push(e.data)
      }
    }

    mediaRecorder.current.onstop = () => {
      console.log(
        'ONSTOP',
        `finishedRecording: ${finishedRecording}`,
        `recordingCancelled: ${recordingCancelled.current}`
      )

      stream.getTracks().forEach((track) => track.stop())

      let blob = null

      if (!recordingCancelled.current) {
        blob = new Blob(recordedChunks.current)

        if (blob.size <= 5 * 1024 * 1024) {
          setVoiceClip(blob)
        }
      }

      setIsRecordingVoiceClip(false)
      recordedChunks.current = []
      recordingCancelled.current = false

      if (blob && blob.size > 5 * 1024 * 1024) {
        return toast('Voice clip is too large.', { icon: '❌' })
      }

      setIsRecordingVoiceClip(false)
      return
    }

    mediaRecorder.current.start()
    setIsRecordingVoiceClip(true)
  }

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop()
    }
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!message.length || message.length > 500) return

    socket?.emit('message', { chat: chat._id, content: message })

    setMessage('')
  }

  return (
    <div className="px-[16px] py-[10px] flex items-center gap-[16px]">
      {isRecordingVoiceClip || voiceClip ? (
        <>
          <button
            className="chat-icon"
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
              className="chat-icon bg-white rounded-full"
              aria-label={finishedRecording ? 'Play my voice clip' : 'Finish recording'}
              onClick={() => {
                if (finishedRecording) {
                  const audio = document.getElementById('voice-clip-preview') as HTMLAudioElement
                  audio?.play()
                } else {
                  setFinishedRecording(true)
                  stopRecording()
                }
              }}
            >
              {finishedRecording ? <PlayFill size={20} aria-hidden /> : <StopFill size={20} aria-hidden />}
            </button>

            <input type="text" className="bg-secondary w-0" tabIndex={-1} aria-hidden />

            <div className="bg-white text-secondary font-semibold px-[8px] rounded-full">0:00</div>
          </div>

          <button
            className="chat-icon"
            aria-label="Send voice clip"
            onClick={(e) => {
              const button = e.currentTarget

              if (finishedRecording) {
                if (!voiceClip) return

                socket?.emit('message', { chat: chat._id, voiceClip })
                setVoiceClip(null)
                setFinishedRecording(false)
              } else {
                setFinishedRecording(true)
                stopRecording()
                setTimeout(() => {
                  button?.click()
                }, 100)
              }
            }}
          >
            <SendFill size={20} aria-hidden />
          </button>

          <audio id="voice-clip-preview" className="hidden"></audio>
        </>
      ) : (
        <>
          <button className="chat-icon" aria-label="Send a voice clip" onClick={startRecording}>
            <MicFill size={20} aria-hidden />
          </button>

          <button className="chat-icon" aria-label="Attach a file">
            <Image size={20} aria-hidden />
          </button>

          <form className="py-[12px] px-[24px] flex items-center bg-black-5 flex-1 rounded-full" onSubmit={onSubmit}>
            <input
              type="text"
              className="pr-[12px] bg-black-5 placeholder:text-black-50 text-black-75 flex-1 outline-none w-0"
              placeholder="Aa"
              aria-label="Message"
              value={message}
              onChange={(e) => {
                if (e.target.value.length > 500) {
                  return toast('Maximum message length is 500 characters.', { icon: '❌' })
                }

                setMessage(e.target.value)
              }}
            />

            <button type="button" className="chat-icon" aria-label="Choose an emoji">
              <EmojiSmileFill size={20} aria-hidden />
            </button>
          </form>

          <button className="chat-icon" aria-label="Send a like">
            <HandThumbsUpFill size={20} aria-hidden />
          </button>
        </>
      )}
    </div>
  )
}

export default ChatBottom
