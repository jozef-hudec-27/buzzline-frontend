'use client'

import useUserStore from './zustand/userStore'
import { useEffect } from 'react'

function FetchUser() {
  const fetchUser = useUserStore((state) => state.fetchUser)

  useEffect(() => {
    fetchUser()
  }, [])

  return <></>
}

export default FetchUser
