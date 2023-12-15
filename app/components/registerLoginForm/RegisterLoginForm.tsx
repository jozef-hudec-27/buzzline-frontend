'use client'

import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

import api from '@/app/api/axiosInstance'

import { LoginFormState, RegisterFormState } from '@/app/register/types'
import { AxiosError } from 'axios'

type RegisterProps = {
  type: 'register'
  page: 0 | 1
  setPage: React.Dispatch<React.SetStateAction<0 | 1>>
  formState: RegisterFormState
  setFormState: React.Dispatch<React.SetStateAction<RegisterFormState>>
}

type LoginProps = {
  type: 'login'
  formState: LoginFormState
  setFormState: React.Dispatch<React.SetStateAction<LoginFormState>>
}

function RegisterLoginForm(props: RegisterProps | LoginProps) {
  const router = useRouter()
  const { type, formState, setFormState } = props

  const changeState = <T extends LoginFormState | RegisterFormState>(key: keyof T, value: string) => {
    // @ts-ignore
    setFormState((prevState: T) => ({ ...prevState, [key]: value } as T))
  }

  const registerMutation = useMutation({
    mutationFn: async (user: RegisterFormState) => {
      document.getElementById('form-errors')?.replaceChildren() // Clear form errors
      return await api().post('/auth/register', user)
    },
    onSuccess: (data) => {
      router.replace('/login')
      toast('Successfully registered! You can now log in.', { icon: '🎉', duration: 6000 })
    },
    onError: (error: AxiosError) => {
      if (error.response?.data) {
        const { errors } = error.response.data as { errors: { msg: string; path: string }[] }

        errors.forEach((error) => {
          const errorElement = document.createElement('li')
          errorElement.textContent = error.msg
          document.getElementById('form-errors')?.appendChild(errorElement)
        })
      } else {
        toast('Something went wrong. Please try again later.', { icon: '❌' })
      }
    },
  })

  return (
    <form
      className="w-full flex flex-col gap-[12px]"
      onSubmit={async (e) => {
        e.preventDefault()

        if (type === 'register') {
          if (props.page === 0) {
            props.setPage(1)
          } else {
            registerMutation.mutate(formState)
          }
        } else {
        }
      }}
    >
      {type === 'register' ? (
        // REGISTER
        <>
          {props.page === 0 ? (
            <>
              <input
                type="text"
                placeholder="First name"
                className="input"
                autoComplete="given-name"
                value={formState.firstName}
                onChange={(e) => changeState<RegisterFormState>('firstName', e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Last name"
                className="input"
                autoComplete="family-name"
                value={formState.lastName}
                onChange={(e) => changeState<RegisterFormState>('lastName', e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email address"
                className="input"
                autoComplete="email"
                value={formState.email}
                onChange={(e) => changeState<RegisterFormState>('email', e.target.value)}
                required
              />
            </>
          ) : (
            <>
              <input
                type="password"
                placeholder="Password"
                className="input"
                autoComplete="new-password"
                value={formState.password}
                onChange={(e) => changeState<RegisterFormState>('password', e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Confirm password"
                className="input mb-[60px]"
                autoComplete="new-password"
                value={formState.confirmPassword}
                onChange={(e) => changeState<RegisterFormState>('confirmPassword', e.target.value)}
                required
              />
            </>
          )}

          <div className="w-fit mt-[12px] flex items-center gap-[24px]">
            <button
              className={`btn primary ${registerMutation.isPending ? 'cursor-wait' : ''}`}
              disabled={registerMutation.isPending || registerMutation.isSuccess}
            >
              {props.page === 0 ? 'Continue' : 'Sign up'}
            </button>

            {props.page === 0 ? (
              <Link href="/login" className="underline">
                Already have an account?
              </Link>
            ) : (
              <Link
                href=""
                className="underline"
                onClick={(e) => {
                  e.preventDefault()

                  props.setPage(0)
                }}
              >
                Go back
              </Link>
            )}
          </div>
        </>
      ) : (
        // LOGIN
        <>
          <input
            type="email"
            placeholder="Email address"
            className="input"
            autoComplete="email"
            value={formState.email}
            onChange={(e) => changeState<LoginFormState>('email', e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="input"
            autoComplete="current-password"
            value={formState.password}
            onChange={(e) => changeState<LoginFormState>('password', e.target.value)}
            required
          />

          <div className="w-fit mt-[12px] flex items-center gap-[24px]">
            <button className="btn primary">Log in</button>

            <Link href="/register" className="underline">
              Don't have an account yet?
            </Link>
          </div>
        </>
      )}

      <ul id="form-errors" className="text-red-500 list-disc"></ul>
    </form>
  )
}

export default RegisterLoginForm
