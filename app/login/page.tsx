'use client'

import { useState } from 'react'

import Navbar from '../components/navbar/Navbar'
import LoginForm from './LoginForm'
import { LoginFormState } from '../register/types'

function LoginPage() {
  const [formState, setFormState] = useState<LoginFormState>({ email: '', password: '' })

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

export default LoginPage
