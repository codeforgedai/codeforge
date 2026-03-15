import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useApi } from '@/hooks/use-api'

interface ActivityEvent {
  id: string
  actor: string
  action: string
  target: string
  timestamp: string
}

export function RecentActivity() {
  const { data: events } = useApi<ActivityEvent[]>('/overview/activity')

  const placeholders: ActivityEvent[] = [
    {
      id: '1',
      actor: 'backend-agent',
      action: 'completed task',
      target: 'Implement user auth',
      timestamp: '2 min ago',
    },
    {
      id: '2',
      actor: 'frontend-agent',
      action: 'started pipeline',
      target: 'Build dashboard UI',
      timestamp: '15 min ago',
    },
    {
      id: '3',
      actor: 'devops-agent',
      action: 'requested approval',
      target: 'Deploy to staging',
      timestamp: '1 hour ago',
    },
    {
      id: '4',
      actor: 'qa-agent',
      action: 'filed bug',
      target: 'Login flow regression',
      timestamp: '3 hours ago',
    },
    {
      id: '5',
      actor: 'architect-agent',
      action: 'updated goal',
      target: 'Q1 Platform Reliability',
      timestamp: '5 hours ago',
    },
  ]

  const items = events ?? placeholders

  return (
    <div className='space-y-8'>
      {items.map((event) => (
        <div key={event.id} className='flex items-center'>
          <Avatar className='h-9 w-9'>
            <AvatarFallback>
              {event.actor.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className='ms-4 space-y-1'>
            <p className='text-sm font-medium leading-none'>{event.actor}</p>
            <p className='text-sm text-muted-foreground'>
              {event.action}: {event.target}
            </p>
          </div>
          <div className='ms-auto text-xs text-muted-foreground'>
            {event.timestamp}
          </div>
        </div>
      ))}
    </div>
  )
}
