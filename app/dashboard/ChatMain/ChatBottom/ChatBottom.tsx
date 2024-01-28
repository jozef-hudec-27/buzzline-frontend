'use client'

import { useRef, useState, useEffect } from 'react'
import { MicFill, Image, HandThumbsUpFill } from 'react-bootstrap-icons'
import toast from 'react-hot-toast'
import getBlobDuration from 'get-blob-duration'

import useSocketStore from '@/app/zustand/socketStore'
import useCurrentChatStore from '@/app/zustand/currentChatStore'

import EmojiButton from './EmojiButton'
import VoiceClipRecording from './VoiceClipRecording'

function ChatBottom() {
  const socket = useSocketStore((state) => state.socket)
  const chat = useCurrentChatStore((state) => state.chat)

  const [message, setMessage] = useState('')

  //   Voice clip recording
  const [isRecordingVoiceClip, setIsRecordingVoiceClip] = useState(false)
  const recordingCancelled = useRef(false)
  const [voiceClip, setVoiceClip] = useState<Blob | null>(null)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const recordedChunks = useRef<Blob[]>([])

  const imageInput = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const audio = document.getElementById('voice-clip-preview') as HTMLAudioElement

    if (voiceClip && audio) {
      audio.src = URL.createObjectURL(voiceClip)

      const getDuration = async () => {
        const duration = await getBlobDuration(voiceClip)
        audio.dataset.duration = duration.toString()
      }

      getDuration()
    } else if (audio) {
      audio.src = ''
      audio.dataset.duration = ''
    }
  }, [voiceClip])

  useEffect(() => {
    if (message.length > 0) {
      socket?.emit('typing', { chat: chat._id, isTyping: true })
    } else {
      socket?.emit('typing', { chat: chat._id, isTyping: false })
    }
  }, [message])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = new MediaRecorder(stream)
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunks.current.push(e.data)
        }
      }

      mediaRecorder.current.onstop = () => {
        stream.getTracks().forEach((track) => track.stop())

        let blob = null

        if (!recordingCancelled.current) {
          blob = new Blob(recordedChunks.current, { type: 'audio/mpeg' })

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
    } catch (err) {
      toast('Microphone access is needed to send a voice clip.', { icon: '🎤' })
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop()
    }
  }

  const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!message.length || message.length > 500) return

    socket?.emit('message', { chat: chat._id, content: message })

    setMessage('')
  }

  return (
    <div className="px-[16px] py-[10px] flex items-center gap-[16px]">
      {isRecordingVoiceClip || voiceClip ? (
        <VoiceClipRecording
          chat={chat}
          voiceClip={voiceClip}
          setVoiceClip={setVoiceClip}
          recordingCancelled={recordingCancelled}
          stopRecording={stopRecording}
        />
      ) : (
        <>
          <button
            className="chat-icon"
            aria-label="Record a voice clip"
            title="Record a voice clip"
            onClick={startRecording}
          >
            <MicFill size={20} aria-hidden />
          </button>

          <button
            className="chat-icon"
            aria-label="Send an image"
            title="Send an image"
            onClick={() => imageInput.current?.click()}
          >
            <Image size={20} aria-hidden />
          </button>

          <form className="py-[12px] px-[24px] flex items-center bg-black-5 flex-1 rounded-full" onSubmit={sendMessage}>
            <input
              type="text"
              className="pr-[12px] bg-black-5 placeholder:text-black-50 text-black-75 flex-1 outline-none w-0"
              placeholder="Aa"
              aria-label="Message"
              value={message}
              onChange={(e) => {
                const newMsg = e.target.value

                if (newMsg.length > 500) {
                  return toast('Maximum message length is 500 characters.', { icon: '❌' })
                }

                setMessage(newMsg)
              }}
            />

            <EmojiButton setMessage={setMessage} />
          </form>

          <button
            className="chat-icon"
            aria-label="Send a like"
            title="Send a like"
            onClick={() => socket?.emit('message', { chat: chat._id, content: '👍' })}
          >
            <HandThumbsUpFill size={20} aria-hidden />
          </button>

          <input
            type="file"
            className="hidden"
            ref={imageInput}
            onChange={(e) => {
              const file = e.target.files?.[0]

              if (!file) return

              if (!file.type.startsWith('image')) {
                return toast('File must be an image.', { icon: '❌' })
              } else if (file.size > 5 * 1024 * 1024) {
                return toast('Image is too large.', { icon: '❌' })
              }

              socket?.emit('message', { chat: chat._id, image: file })
            }}
          />
        </>
      )}
    </div>
  )
}

export default ChatBottom
