'use client'

import { useRouter } from 'next/navigation'

import userStore from './zustand/userStore'

export default function Home() {
  const router = useRouter()

  const isLoggedIn = userStore((state) => state.isLoggedIn)
  const isLoading = userStore((state) => state.isLoading)

  if (isLoading) return

  if (!isLoggedIn) {
    return router.push('/register')
  }

  return <div>DASHBOARD</div>
}
