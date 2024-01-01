'use client'

import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

import api from '@/app/api/axiosInstance'
import useUserStore from '../zustand/userStore'

import { LoginFormState } from '@/app/types'
import { AxiosError } from 'axios'
import { ChangeEvent, ComponentPropsWithoutRef, Dispatch, FormEvent, SetStateAction } from 'react'

type LoginFormProps = {
  formState: LoginFormState
  setFormState: Dispatch<SetStateAction<LoginFormState>>
}

function LoginForm(props: LoginFormProps) {
  const router = useRouter()
  const fetchUser = useUserStore((state) => state.fetchUser)
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
    onSuccess: (data) => {
      const accessToken: string = data?.data?.accessToken
      localStorage.setItem('accessToken', accessToken)
      fetchUser()
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
          className={`btn primary ${loginMutation.isPending ? 'cursor-wait' : ''}`}
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
