import { useNavigate } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useApi } from '@/hooks/use-api'

interface Task {
  id: string
  title: string
  status: string
  priority: string
  assignee: string | null
  pr_url: string | null
}

const columns = [
  { key: 'backlog', label: 'Backlog' },
  { key: 'todo', label: 'Todo' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'in_review', label: 'In Review' },
  { key: 'done', label: 'Done' },
] as const

const priorityColors: Record<string, string> = {
  high: 'bg-red-500/10 text-red-600 border-red-500/20',
  medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  low: 'bg-green-500/10 text-green-600 border-green-500/20',
}

const placeholderTasks: Task[] = [
  { id: '1', title: 'Set up CI/CD pipeline', status: 'done', priority: 'high', assignee: 'devops-agent', pr_url: null },
  { id: '2', title: 'Implement user auth', status: 'in_review', priority: 'high', assignee: 'backend-agent', pr_url: 'https://github.com/org/repo/pull/42' },
  { id: '3', title: 'Build dashboard UI', status: 'in_progress', priority: 'medium', assignee: 'frontend-agent', pr_url: null },
  { id: '4', title: 'Add API rate limiting', status: 'todo', priority: 'medium', assignee: 'backend-agent', pr_url: null },
  { id: '5', title: 'Write integration tests', status: 'backlog', priority: 'low', assignee: null, pr_url: null },
  { id: '6', title: 'Optimize database queries', status: 'backlog', priority: 'medium', assignee: null, pr_url: null },
  { id: '7', title: 'Refactor auth middleware', status: 'todo', priority: 'low', assignee: 'backend-agent', pr_url: null },
]

export function KanbanBoard() {
  const { data: tasks } = useApi<Task[]>('/tasks')
  const navigate = useNavigate()
  const items = tasks ?? placeholderTasks

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-5'>
      {columns.map((col) => {
        const colTasks = items.filter((t) => t.status === col.key)
        return (
          <div key={col.key} className='flex flex-col gap-2'>
            <div className='flex items-center justify-between px-1'>
              <h3 className='text-sm font-semibold'>{col.label}</h3>
              <Badge variant='secondary' className='text-xs'>
                {colTasks.length}
              </Badge>
            </div>
            <ScrollArea className='h-[calc(100vh-16rem)]'>
              <div className='flex flex-col gap-2 p-1'>
                {colTasks.map((task) => (
                  <Card
                    key={task.id}
                    className='cursor-pointer transition-colors hover:bg-accent/50'
                    onClick={() => navigate({ to: '/tasks/$taskId', params: { taskId: task.id } })}
                  >
                    <CardHeader className='p-3 pb-1'>
                      <CardTitle className='text-sm font-medium leading-snug'>
                        {task.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='p-3 pt-1'>
                      <div className='flex items-center justify-between'>
                        <Badge
                          variant='outline'
                          className={priorityColors[task.priority] ?? ''}
                        >
                          {task.priority}
                        </Badge>
                        {task.assignee && (
                          <span className='text-xs text-muted-foreground truncate max-w-[80px]'>
                            {task.assignee}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {colTasks.length === 0 && (
                  <div className='text-center text-xs text-muted-foreground py-8'>
                    No tasks
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )
      })}
    </div>
  )
}
