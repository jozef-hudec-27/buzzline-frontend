'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import userStore from './zustand/userStore'

export default function Home() {
  const router = useRouter()
  const isLoggedIn = userStore((state) => state.isLoggedIn)
  const isLoading = userStore((state) => state.isLoading)

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace('/register')
    }
  }, [isLoggedIn, isLoading])

  if (isLoggedIn) {
    return <div>DASHBOARD</div>
  }
}
