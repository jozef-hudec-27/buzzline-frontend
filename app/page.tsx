'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import DashBoard from './dashboard/Dashboard'

import useUserStore from './zustand/userStore'

export default function Home() {
  const router = useRouter()

  const [isLoggedIn, isLoading] = useUserStore((state) => [state.isLoggedIn, state.isLoading])

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace('/register')
    }
  }, [isLoggedIn, isLoading])

  if (isLoggedIn) {
    return <DashBoard />
  }
}
