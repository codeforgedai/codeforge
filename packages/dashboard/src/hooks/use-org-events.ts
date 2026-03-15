import { useCallback, useEffect, useRef, useState } from 'react'

const WS_BASE =
  import.meta.env.VITE_WS_URL || 'ws://localhost:3100/ws'

export interface OrgEvent {
  type: string
  payload: Record<string, unknown>
  timestamp: string
}

interface UseOrgEventsOptions {
  orgId: string
  onEvent?: (event: OrgEvent) => void
}

export function useOrgEvents({ orgId, onEvent }: UseOrgEventsOptions) {
  const [connected, setConnected] = useState(false)
  const [events, setEvents] = useState<OrgEvent[]>([])
  const wsRef = useRef<WebSocket | null>(null)

  const connect = useCallback(() => {
    if (wsRef.current) return

    const ws = new WebSocket(`${WS_BASE}/orgs/${orgId}/events`)
    wsRef.current = ws

    ws.onopen = () => setConnected(true)
    ws.onclose = () => {
      setConnected(false)
      wsRef.current = null
    }

    ws.onmessage = (msg) => {
      try {
        const event: OrgEvent = JSON.parse(msg.data)
        setEvents((prev) => [event, ...prev].slice(0, 100))
        onEvent?.(event)
      } catch {
        // ignore malformed messages
      }
    }
  }, [orgId, onEvent])

  const disconnect = useCallback(() => {
    wsRef.current?.close()
    wsRef.current = null
  }, [])

  useEffect(() => {
    connect()
    return disconnect
  }, [connect, disconnect])

  return { connected, events, disconnect }
}
