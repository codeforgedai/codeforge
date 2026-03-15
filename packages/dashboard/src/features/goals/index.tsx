import { ChevronRight } from 'lucide-react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useApi } from '@/hooks/use-api'

interface Goal {
  id: string
  title: string
  level: 'outcome' | 'objective' | 'task'
  progress: number
  children?: Goal[]
}

const placeholderGoals: Goal[] = [
  {
    id: '1',
    title: 'Ship v1.0 Platform',
    level: 'outcome',
    progress: 65,
    children: [
      {
        id: '1a',
        title: 'Core API complete',
        level: 'objective',
        progress: 80,
        children: [
          { id: '1a1', title: 'Auth endpoints', level: 'task', progress: 100 },
          { id: '1a2', title: 'Agent CRUD', level: 'task', progress: 90 },
          { id: '1a3', title: 'Pipeline execution', level: 'task', progress: 50 },
        ],
      },
      {
        id: '1b',
        title: 'Dashboard MVP',
        level: 'objective',
        progress: 50,
        children: [
          { id: '1b1', title: 'Agent management UI', level: 'task', progress: 70 },
          { id: '1b2', title: 'Pipeline live view', level: 'task', progress: 30 },
        ],
      },
    ],
  },
  {
    id: '2',
    title: 'Achieve 99.9% uptime',
    level: 'outcome',
    progress: 85,
    children: [
      {
        id: '2a',
        title: 'Monitoring & alerting',
        level: 'objective',
        progress: 90,
      },
    ],
  },
]

const levelColors: Record<string, string> = {
  outcome: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  objective: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  task: 'bg-green-500/10 text-green-600 border-green-500/20',
}

function GoalNode({ goal, depth = 0 }: { goal: Goal; depth?: number }) {
  const hasChildren = goal.children && goal.children.length > 0

  if (!hasChildren) {
    return (
      <div className='flex items-center justify-between py-2 ps-4' style={{ paddingLeft: `${depth * 1.5 + 1}rem` }}>
        <div className='flex items-center gap-2'>
          <Badge variant='outline' className={levelColors[goal.level] ?? ''}>
            {goal.level}
          </Badge>
          <span className='text-sm'>{goal.title}</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='h-2 w-24 rounded-full bg-muted'>
            <div
              className='h-2 rounded-full bg-primary'
              style={{ width: `${goal.progress}%` }}
            />
          </div>
          <span className='text-xs text-muted-foreground w-8'>{goal.progress}%</span>
        </div>
      </div>
    )
  }

  return (
    <Collapsible defaultOpen>
      <CollapsibleTrigger className='flex w-full items-center justify-between py-2 hover:bg-accent/50 rounded px-2' style={{ paddingLeft: `${depth * 1.5 + 0.5}rem` }}>
        <div className='flex items-center gap-2'>
          <ChevronRight className='h-4 w-4 transition-transform [[data-state=open]>&]:rotate-90' />
          <Badge variant='outline' className={levelColors[goal.level] ?? ''}>
            {goal.level}
          </Badge>
          <span className='text-sm font-medium'>{goal.title}</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='h-2 w-24 rounded-full bg-muted'>
            <div
              className='h-2 rounded-full bg-primary'
              style={{ width: `${goal.progress}%` }}
            />
          </div>
          <span className='text-xs text-muted-foreground w-8'>{goal.progress}%</span>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {goal.children?.map((child) => (
          <GoalNode key={child.id} goal={child} depth={depth + 1} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

export function Goals() {
  const { data: goals } = useApi<Goal[]>('/goals')
  const items = goals ?? placeholderGoals

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
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Goals</h2>
          <p className='text-muted-foreground'>
            Track objectives and key results across your organization.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>OKR Tree</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-1'>
              {items.map((goal) => (
                <GoalNode key={goal.id} goal={goal} />
              ))}
            </div>
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
