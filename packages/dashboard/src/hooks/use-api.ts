import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api-client'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => void
}

export function useApi<T>(path: string, options?: RequestInit): UseApiState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(() => {
    setLoading(true)
    setError(null)
    apiFetch<T>(path, options)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [path])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
