import { getRouteApi } from '@tanstack/react-router'
import { ExternalLink } from 'lucide-react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useApi } from '@/hooks/use-api'

const route = getRouteApi('/_authenticated/tasks/$taskId')

interface TaskDetail {
  id: string
  title: string
  description: string
  status: string
  priority: string
  assignee: string | null
  pr_url: string | null
  pipeline_run_ids: string[]
  comments: Array<{ author: string; body: string; created_at: string }>
}

export function TaskDetailPage() {
  const { taskId } = route.useParams()
  const { data: task } = useApi<TaskDetail>(`/tasks/${taskId}`)

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
        <div className='flex flex-wrap items-center gap-3'>
          <h2 className='text-2xl font-bold tracking-tight'>
            {task?.title ?? `Task ${taskId}`}
          </h2>
          {task && <Badge variant='outline'>{task.status}</Badge>}
          {task && <Badge variant='outline'>{task.priority}</Badge>}
        </div>

        <div className='grid gap-4 md:grid-cols-3'>
          <Card className='md:col-span-2'>
            <CardHeader>
              <CardTitle className='text-sm font-medium'>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground whitespace-pre-wrap'>
                {task?.description ?? 'No description provided.'}
              </p>
            </CardContent>
          </Card>

          <div className='flex flex-col gap-4'>
            <Card>
              <CardHeader>
                <CardTitle className='text-sm font-medium'>Assignee</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm'>{task?.assignee ?? 'Unassigned'}</p>
              </CardContent>
            </Card>

            {task?.pr_url && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-sm font-medium'>Pull Request</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant='outline' size='sm' asChild>
                    <a href={task.pr_url} target='_blank' rel='noopener noreferrer'>
                      <ExternalLink className='mr-1 h-3 w-3' />
                      View PR
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className='text-sm font-medium'>Pipeline Runs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground'>
                  {task?.pipeline_run_ids?.length ?? 0} linked runs
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>Comments</CardTitle>
          </CardHeader>
          <CardContent>
            {(task?.comments?.length ?? 0) === 0 ? (
              <p className='text-sm text-muted-foreground'>No comments yet.</p>
            ) : (
              <div className='space-y-4'>
                {task?.comments.map((c, i) => (
                  <div key={i} className='border-b pb-3 last:border-0'>
                    <div className='flex items-center gap-2 mb-1'>
                      <span className='text-sm font-medium'>{c.author}</span>
                      <span className='text-xs text-muted-foreground'>{c.created_at}</span>
                    </div>
                    <p className='text-sm text-muted-foreground'>{c.body}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
