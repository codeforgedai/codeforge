import { useCallback, useEffect, useRef, useState } from 'react'

const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:3100/api/v1'

export interface RunStreamEvent {
  type: 'step_start' | 'step_output' | 'step_complete' | 'run_complete' | 'error'
  step_name?: string
  output?: string
  status?: string
  duration_ms?: number
  cost_usd?: number
  error?: string
  timestamp: string
}

interface UseRunStreamOptions {
  runId: string
  enabled?: boolean
}

export function useRunStream({ runId, enabled = true }: UseRunStreamOptions) {
  const [events, setEvents] = useState<RunStreamEvent[]>([])
  const [connected, setConnected] = useState(false)
  const [done, setDone] = useState(false)
  const sourceRef = useRef<EventSource | null>(null)

  const connect = useCallback(() => {
    if (!enabled || sourceRef.current) return

    const es = new EventSource(`${API_BASE}/runs/${runId}/stream`, {
      withCredentials: true,
    })
    sourceRef.current = es

    es.onopen = () => setConnected(true)

    es.onmessage = (msg) => {
      try {
        const event: RunStreamEvent = JSON.parse(msg.data)
        setEvents((prev) => [...prev, event])
        if (event.type === 'run_complete' || event.type === 'error') {
          setDone(true)
          es.close()
          sourceRef.current = null
        }
      } catch {
        // ignore malformed SSE
      }
    }

    es.onerror = () => {
      setConnected(false)
      es.close()
      sourceRef.current = null
    }
  }, [runId, enabled])

  const disconnect = useCallback(() => {
    sourceRef.current?.close()
    sourceRef.current = null
    setConnected(false)
  }, [])

  useEffect(() => {
    connect()
    return disconnect
  }, [connect, disconnect])

  return { events, connected, done }
}
