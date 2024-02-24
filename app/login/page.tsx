'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

import useUserStore from '@/app/zustand/userStore'

import Navbar from '../components/navbar/Navbar'
import LoginForm from './LoginForm'

import { LoginFormState } from '../types/formTypes'

function LoginPage() {
  const router = useRouter()
  const [isLoggedIn, isLoading] = useUserStore((state) => [state.isLoggedIn, state.isLoading])

  const [formState, setFormState] = useState<LoginFormState>({ email: '', password: '' })

  useEffect(() => {
    if (localStorage.getItem('autoLogout')) {
      // User was logged out due to expired refresh token
      localStorage.removeItem('autoLogout')
      toast('You were automatically logged out. Please log in again.')
    }
  }, [])

  useEffect(() => {
    if (isLoggedIn && !isLoading) {
      router.replace('/')
    }
  }, [isLoggedIn, isLoading])

  if (!isLoggedIn && !isLoading) {
    return (
      <div>
        <Navbar />

        <section className="mt-[48px] sm:mt-[96px]">
          <div className="flex flex-col gap-[32px] w-fit mx-auto">
            <h1 className="gradient-text text-[60px] sm:text-[90px] leading-none">
              Log in to
              <br /> BuzzLine
            </h1>

            <LoginForm formState={formState} setFormState={setFormState} />
          </div>
        </section>
      </div>
    )
  }
}

export default LoginPage
