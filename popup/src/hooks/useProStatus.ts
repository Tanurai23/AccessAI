// hooks/useProStatus.ts
import { useState, useEffect } from 'react'
import { getProStatus } from '@/pro'

export const useProStatus = () => {
  const [isPro, setIsPro] = useState<'free' | 'pro'>('free')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProStatus().then(status => {
      setIsPro(status)
      setLoading(false)
    })
  }, [])

  return { isPro, loading }
}