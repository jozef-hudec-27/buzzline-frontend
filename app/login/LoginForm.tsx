'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useShallow } from 'zustand/react/shallow'
import Link from 'next/link'
import toast from 'react-hot-toast'

import useUserStore from '../zustand/userStore'
import useSocketStore from '../zustand/socketStore'
import usePeerStore from '../zustand/webrtc/peerStore'
import useMediaCallStore from '../zustand/webrtc/mediaCallStore'
import useMediaStreamStore from '../zustand/webrtc/mediaStreamStore'

import api from '@/app/api/axiosInstance'
import { configurePeer } from '../utils/peerUtils'

import { LoginFormState } from '../types/formTypes'
import { AxiosError } from 'axios'
import { ChangeEvent, ComponentPropsWithoutRef, Dispatch, FormEvent, SetStateAction } from 'react'

type LoginFormProps = {
  formState: LoginFormState
  setFormState: Dispatch<SetStateAction<LoginFormState>>
}

function LoginForm(props: LoginFormProps) {
  const router = useRouter()

  const fetchUser = useUserStore((state) => state.fetchUser)
  const socketRef = useSocketStore((state) => state.socketRef)
  const [initPeer, killPeer] = usePeerStore(useShallow((state) => [state.initPeer, state.killPeer]))
  const [setCurrentCall, currentCallRef, setIncomingCall, incomingCallRef, setOutcomingCall, outcomingCallRef] =
    useMediaCallStore(
      useShallow((state) => [
        state.setCurrentCall,
        state.currentCallRef,
        state.setIncomingCall,
        state.incomingCallRef,
        state.setOutcomingCall,
        state.outcomingCallRef,
      ])
    )
  const [setLocalMediaStream, setRemoteMediaStream] = useMediaStreamStore(
    useShallow((state) => [state.setLocalMediaStream, state.setRemoteMediaStream])
  )

  const { formState, setFormState } = props

  const changeState = <T extends LoginFormState>(key: keyof T, value: string) => {
    // @ts-ignore
    setFormState((prevState: T) => ({ ...prevState, [key]: value } as T))
  }

  const loginMutation = useMutation({
    mutationFn: async (user: LoginFormState) => {
      document.getElementById('form-errors')?.replaceChildren() // Clear form errors
      return await api().post('/auth/login', user)
    },
    onSuccess: async (data) => {
      const accessToken: string = data?.data?.accessToken
      localStorage.setItem('accessToken', accessToken)
      const user = await fetchUser()
      const peer = await initPeer(user._id)

      configurePeer({
        peer,
        killPeer,
        userId: user._id,
        socketRef,
        currentCallRef,
        setCurrentCall,
        setLocalMediaStream,
        setRemoteMediaStream,
        incomingCallRef,
        setIncomingCall,
        outcomingCallRef,
        setOutcomingCall,
      })

      router.replace('/')
    },
    onError: (error: AxiosError) => {
      if (error.response?.data) {
        const { message } = error.response.data as { message: string }
        toast(message, { icon: '❌' })
      } else {
        toast('Something went wrong. Please try again later.', { icon: '❌' })
      }
    },
  })

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()

    loginMutation.mutate(formState)
  }

  const inputs: ComponentPropsWithoutRef<'input'>[] = [
    {
      type: 'email',
      placeholder: 'Email address',
      autoComplete: 'email',
      value: formState.email,
      'aria-label': 'Email address',
      autoFocus: true,
      onChange: (e: ChangeEvent<HTMLInputElement>) => changeState<LoginFormState>('email', e.target.value),
    },
    {
      type: 'password',
      placeholder: 'Password',
      autoComplete: 'current-password',
      value: formState.password,
      'aria-label': 'Password',
      onChange: (e: ChangeEvent<HTMLInputElement>) => changeState<LoginFormState>('password', e.target.value),
    },
  ]

  return (
    <form className="w-full flex flex-col gap-[12px]" onSubmit={onSubmit}>
      {inputs.map((input, i) => (
        <input key={i} {...input} className="input" required />
      ))}

      <div className="w-fit mt-[12px] flex items-center gap-[24px]">
        <button
          className={`btn btn--primary ${loginMutation.isPending ? 'cursor-wait' : ''}`}
          disabled={loginMutation.isPending || loginMutation.isSuccess}
        >
          Log in
        </button>

        <Link href="/register" className="underline">
          Don't have an account yet?
        </Link>
      </div>

      <ul id="form-errors" className="text-red-500 list-disc"></ul>
    </form>
  )
}

export default LoginForm
