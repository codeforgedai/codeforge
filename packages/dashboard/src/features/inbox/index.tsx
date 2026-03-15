import { Bot, GitBranch, ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useApi } from '@/hooks/use-api'

interface InboxItem {
  id: string
  type: 'approval' | 'agent_error' | 'pipeline_complete' | 'task_assigned' | 'mention'
  title: string
  body: string
  read: boolean
  created_at: string
  action_url?: string
}

const typeIcons: Record<string, React.ElementType> = {
  approval: ShieldCheck,
  agent_error: AlertCircle,
  pipeline_complete: GitBranch,
  task_assigned: CheckCircle,
  mention: Bot,
}

const placeholderItems: InboxItem[] = [
  { id: '1', type: 'approval', title: 'Approval required: Hire ML Agent', body: 'architect-agent wants to hire a new ML specialist.', read: false, created_at: '10 min ago', action_url: '/approvals' },
  { id: '2', type: 'agent_error', title: 'qa-agent encountered an error', body: 'Test suite failed with exit code 1. Check logs for details.', read: false, created_at: '30 min ago', action_url: '/agents/4' },
  { id: '3', type: 'pipeline_complete', title: 'Pipeline "Feature Dev" completed', body: 'All 5 steps completed successfully in 12m 34s.', read: false, created_at: '1 hour ago', action_url: '/pipelines/1' },
  { id: '4', type: 'task_assigned', title: 'Task assigned: Add rate limiting', body: 'backend-agent was assigned to implement API rate limiting.', read: true, created_at: '3 hours ago', action_url: '/tasks/4' },
  { id: '5', type: 'mention', title: 'frontend-agent mentioned you', body: 'Need clarification on dashboard color scheme preferences.', read: true, created_at: '5 hours ago' },
]

export function Inbox() {
  const { data: items } = useApi<InboxItem[]>('/inbox')
  const all = items ?? placeholderItems
  const unread = all.filter((i) => !i.read).length

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex items-center gap-3'>
          <h2 className='text-2xl font-bold tracking-tight'>Inbox</h2>
          {unread > 0 && (
            <Badge variant='default'>{unread} new</Badge>
          )}
        </div>
        <p className='text-muted-foreground -mt-2'>
          Consolidated action center for all notifications.
        </p>

        <div className='space-y-2'>
          {all.map((item) => {
            const Icon = typeIcons[item.type] ?? Bot
            return (
              <Card
                key={item.id}
                className={`cursor-pointer transition-colors hover:bg-accent/50 ${!item.read ? 'border-primary/30 bg-primary/5' : ''}`}
                onClick={() => item.action_url && (window.location.href = item.action_url)}
              >
                <CardContent className='flex items-start gap-3 p-4'>
                  <Icon className='h-5 w-5 mt-0.5 shrink-0 text-muted-foreground' />
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between gap-2'>
                      <p className={`text-sm truncate ${!item.read ? 'font-semibold' : 'font-medium'}`}>
                        {item.title}
                      </p>
                      <span className='text-xs text-muted-foreground whitespace-nowrap'>
                        {item.created_at}
                      </span>
                    </div>
                    <p className='text-sm text-muted-foreground mt-0.5'>
                      {item.body}
                    </p>
                  </div>
                  {!item.read && (
                    <div className='h-2 w-2 rounded-full bg-primary shrink-0 mt-2' />
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </Main>
    </>
  )
}
