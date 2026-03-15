import { useEffect, useRef } from 'react'
import { CheckCircle, Circle, Loader2, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type RunStreamEvent } from '@/hooks/use-run-stream'

interface Step {
  name: string
  status: 'pending' | 'running' | 'success' | 'error'
  output: string[]
  duration_ms: number
  cost_usd: number
}

interface PipelineLiveViewProps {
  events: RunStreamEvent[]
  connected: boolean
}

function buildSteps(events: RunStreamEvent[]): Step[] {
  const stepsMap = new Map<string, Step>()

  for (const event of events) {
    const name = event.step_name ?? 'unknown'
    if (!stepsMap.has(name) && event.type === 'step_start') {
      stepsMap.set(name, {
        name,
        status: 'running',
        output: [],
        duration_ms: 0,
        cost_usd: 0,
      })
    }

    const step = stepsMap.get(name)
    if (!step) continue

    if (event.type === 'step_output' && event.output) {
      step.output.push(event.output)
    }

    if (event.type === 'step_complete') {
      step.status = event.status === 'success' ? 'success' : 'error'
      step.duration_ms = event.duration_ms ?? 0
      step.cost_usd = event.cost_usd ?? 0
    }
  }

  return Array.from(stepsMap.values())
}

function StatusIcon({ status }: { status: Step['status'] }) {
  switch (status) {
    case 'running':
      return <Loader2 className='h-4 w-4 animate-spin text-blue-500' />
    case 'success':
      return <CheckCircle className='h-4 w-4 text-green-500' />
    case 'error':
      return <XCircle className='h-4 w-4 text-red-500' />
    default:
      return <Circle className='h-4 w-4 text-gray-400' />
  }
}

export function PipelineLiveView({ events, connected }: PipelineLiveViewProps) {
  const steps = buildSteps(events)

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
        <div
          className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`}
        />
        {connected ? 'Connected' : 'Disconnected'}
      </div>

      {steps.map((step) => (
        <Card key={step.name}>
          <CardHeader className='p-3 pb-1'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <StatusIcon status={step.status} />
                <CardTitle className='text-sm font-medium'>{step.name}</CardTitle>
              </div>
              <div className='flex items-center gap-3 text-xs text-muted-foreground'>
                {step.duration_ms > 0 && (
                  <span>{(step.duration_ms / 1000).toFixed(1)}s</span>
                )}
                {step.cost_usd > 0 && <span>${step.cost_usd.toFixed(4)}</span>}
              </div>
            </div>
          </CardHeader>
          {step.output.length > 0 && (
            <CardContent className='p-3 pt-1'>
              <RunLogViewer lines={step.output} />
            </CardContent>
          )}
        </Card>
      ))}

      {steps.length === 0 && (
        <div className='text-center text-sm text-muted-foreground py-8'>
          Waiting for pipeline events...
        </div>
      )}
    </div>
  )
}

function RunLogViewer({ lines }: { lines: string[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines.length])

  return (
    <div
      ref={scrollRef}
      className='max-h-48 overflow-y-auto rounded bg-muted/50 p-2 font-mono text-xs'
    >
      {lines.map((line, i) => (
        <div key={i} className='whitespace-pre-wrap break-all'>
          {line}
        </div>
      ))}
    </div>
  )
}
