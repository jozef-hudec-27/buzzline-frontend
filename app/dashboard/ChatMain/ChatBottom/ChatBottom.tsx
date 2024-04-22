'use client'

import { useRef, useState, useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { MicFill, Image, HandThumbsUpFill } from 'react-bootstrap-icons'
import toast from 'react-hot-toast'
import getBlobDuration from 'get-blob-duration'
import axios from 'axios'

import useUserStore from '@/app/zustand/userStore'
import useSocketStore from '@/app/zustand/socketStore'
import useCurrentChatStore from '@/app/zustand/currentChatStore'
import useCurrentChatMessagesStore from '@/app/zustand/currentChatMessagesStore'
import useAIChatStore from '@/app/zustand/aiChatStore'

import EmojiButton from './EmojiButton'
import VoiceClipRecording from './VoiceClipRecording'
import { streamToString } from '@/app/utils/utils'
import { MAX_MSG_LENGTH } from '@/app/config'

import { Message, User, ChatShow } from '@/app/types/globalTypes'
import { MySocket } from '@/app/types/socketTypes'

function ChatBottom() {
  const socket = useSocketStore((state) => state.socket)
  const user = useUserStore((state) => state.user)
  const [chat, message, setMessage] = useCurrentChatStore(
    useShallow((state) => [state.chat, state.message, state.setMessage])
  )
  const messages = useCurrentChatMessagesStore((state) => state.messages)
  const [contextAware, isAIGeneratingResponse, setIsGeneratingResponse] = useAIChatStore(
    useShallow((state) => [state.contextAware, state.isGeneratingResponse, state.setIsGeneratingResponse])
  )

  //   Voice clip recording
  const [isRecordingVoiceClip, setIsRecordingVoiceClip] = useState(false)
  const recordingCancelled = useRef(false)
  const [voiceClip, setVoiceClip] = useState<Blob | null>(null)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const recordedChunks = useRef<Blob[]>([])

  const imageInput = useRef<HTMLInputElement | null>(null)
  const removeMsgTipShownRef = useRef(!!localStorage.getItem('removeMsgTipShown'))

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
    if (chat.isAI) return // AI chat doesn't support voice clips

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

  const showMsgRemoveTip = () => {
    if (removeMsgTipShownRef.current) return

    toast('Pro tip: You can remove a message by clicking and holding it.', { icon: '🗑️', duration: 8000 })
    removeMsgTipShownRef.current = true
    localStorage.setItem('removeMsgTipShown', 'true')
  }

  const createMessageHistory = (contextAware: boolean, messages: Message[], user: User, message: string) => {
    return contextAware
      ? [
          ...messages.map((msg) => ({
            role: msg.sender._id === user._id ? 'user' : 'assistant',
            content: msg.content,
          })),
          ,
          { role: 'user', content: message },
        ].filter((m) => !!m)
      : [{ role: 'user', content: message }]
  }

  const postRequest = async (url: string, headers: { [key: string]: string }, body: string) => {
    return await fetch(url, {
      method: 'POST',
      headers: headers,
      body: body,
    })
  }

  const handleResponseError = async (response: Response) => {
    if (!response.ok) {
      const data = await response.json()
      toast(data?.error?.message || 'Failed to get AI response.', { icon: '❌', duration: 8000 })
      setIsGeneratingResponse(false)

      return true
    }
  }

  const partitionResponseString = (responseString: string, maxMsgLength: number) => {
    const stringPartitions = []
    while (responseString.length) {
      stringPartitions.push(responseString.slice(0, maxMsgLength))
      responseString = responseString.slice(maxMsgLength)
    }
    return stringPartitions
  }

  const emitAIMessages = (stringPartitions: string[], socket: MySocket, chat: ChatShow) => {
    stringPartitions.forEach((content, index) => {
      setTimeout(() => {
        socket?.emit('AIMessage', { chat: chat._id, content })
      }, index * 1000)
    })
  }

  const handleAIMessage = async () => {
    const msgHistory = createMessageHistory(contextAware, messages, user, message)

    setIsGeneratingResponse(true)
    const requestBody = JSON.stringify({ messages: msgHistory })
    const signature = await axios.post('/api/signature', requestBody).then((res) => res.data.signature)
    const response = await postRequest(
      '/api/chat',
      {
        'Content-Type': 'application/json',
        'x-hub-signature-256': signature,
      },
      requestBody
    )

    if (await handleResponseError(response)) return

    let responseString = await streamToString(response.body)
    const stringPartitions = partitionResponseString(responseString, MAX_MSG_LENGTH)

    emitAIMessages(stringPartitions, socket, chat)

    setIsGeneratingResponse(false)
  }

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!message.length || message.length > MAX_MSG_LENGTH) return
    showMsgRemoveTip()

    socket?.emit('message', { chat: chat._id, content: message })

    setMessage('')

    if (chat.isAI) {
      handleAIMessage()
    }
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
          {!chat.isAI && (
            <>
              <button
                className="chat__icon-btn"
                aria-label="Record a voice clip"
                title="Record a voice clip"
                onClick={startRecording}
              >
                <MicFill size={20} aria-hidden />
              </button>

              <button
                className="chat__icon-btn"
                aria-label="Send an image"
                title="Send an image"
                onClick={() => imageInput.current?.click()}
              >
                <Image size={20} aria-hidden />
              </button>
            </>
          )}

          <form className="py-[12px] px-[24px] flex items-center bg-black-5 flex-1 rounded-full" onSubmit={sendMessage}>
            <input
              type="text"
              className="pr-[12px] bg-black-5 placeholder:text-black-50 text-black-75 flex-1 outline-none w-0"
              placeholder="Aa"
              aria-label="Message"
              value={message}
              onChange={(e) => {
                if (chat.isAI && isAIGeneratingResponse) return

                const newMsg = e.target.value

                if (newMsg.length > MAX_MSG_LENGTH) {
                  return toast(`Maximum message length is ${MAX_MSG_LENGTH} characters.`, { icon: '❌' })
                }

                setMessage(() => newMsg)
              }}
              autoFocus
            />

            <EmojiButton setMessage={setMessage} />
          </form>

          <button
            className="chat__icon-btn"
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
              if (chat.isAI) return // AI chat doesn't support images

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
