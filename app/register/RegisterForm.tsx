'use client'

import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

import api from '@/app/api/axiosInstance'

import { RegisterFormState } from '@/app/register/types'
import { AxiosError } from 'axios'
import { ChangeEvent, Dispatch, FormEvent, SetStateAction } from 'react'


type RegisterFormProps = {
  page: 0 | 1
  setPage: Dispatch<SetStateAction<0 | 1>>
  formState: RegisterFormState
  setFormState: Dispatch<SetStateAction<RegisterFormState>>
}

function RegisterForm(props: RegisterFormProps) {
  const router = useRouter()
  const { formState, setFormState } = props

  const changeState = <T extends RegisterFormState>(key: keyof T, value: string) => {
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

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (props.page === 0) {
      props.setPage(1)
    } else {
      registerMutation.mutate(formState)
    }
  }

  const inputs1 = [
    {
      type: 'text',
      placeholder: 'First name',
      autoComplete: 'given-name',
      value: formState.firstName,
      onChange: (e: ChangeEvent<HTMLInputElement>) => changeState<RegisterFormState>('firstName', e.target.value),
    },
    {
      type: 'text',
      placeholder: 'Last name',
      autoComplete: 'family-name',
      value: formState.lastName,
      onChange: (e: ChangeEvent<HTMLInputElement>) => changeState<RegisterFormState>('lastName', e.target.value),
    },
    {
      type: 'email',
      placeholder: 'Email address',
      autoComplete: 'email',
      value: formState.email,
      onChange: (e: ChangeEvent<HTMLInputElement>) => changeState<RegisterFormState>('email', e.target.value),
    },
  ]

  const inputs2 = [
    {
      type: 'password',
      placeholder: 'Password',
      autoComplete: 'new-password',
      value: formState.password,
      onChange: (e: ChangeEvent<HTMLInputElement>) => changeState<RegisterFormState>('password', e.target.value),
    },
    {
      type: 'password',
      placeholder: 'Confirm password',
      autoComplete: 'new-password',
      value: formState.confirmPassword,
      onChange: (e: ChangeEvent<HTMLInputElement>) =>
        changeState<RegisterFormState>('confirmPassword', e.target.value),
    },
  ]

  return (
    <form className="w-full flex flex-col gap-[12px]" onSubmit={onSubmit}>
      {props.page === 0 ? (
        <>
          {inputs1.map((input, i) => (
            <input key={i} {...input} className="input" required />
          ))}
        </>
      ) : (
        <>
          {inputs2.map((input, i) => (
            <input key={i} {...input} className="input" required />
          ))}
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

      <ul id="form-errors" className="text-red-500 list-disc"></ul>
    </form>
  )
}

export default RegisterForm
