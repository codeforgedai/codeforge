import { useNavigate } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useApi } from '@/hooks/use-api'

interface Pipeline {
  id: string
  name: string
  steps_count: number
  last_run_status: string | null
  last_run_at: string | null
  total_runs: number
}

const statusColors: Record<string, string> = {
  running: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  success: 'bg-green-500/10 text-green-600 border-green-500/20',
  failed: 'bg-red-500/10 text-red-600 border-red-500/20',
  cancelled: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
}

export function Pipelines() {
  const { data: pipelines } = useApi<Pipeline[]>('/pipelines')
  const navigate = useNavigate()

  const placeholder: Pipeline[] = [
    { id: '1', name: 'Feature Development', steps_count: 5, last_run_status: 'success', last_run_at: '10 min ago', total_runs: 42 },
    { id: '2', name: 'Bug Fix Pipeline', steps_count: 4, last_run_status: 'running', last_run_at: 'now', total_runs: 18 },
    { id: '3', name: 'Code Review', steps_count: 3, last_run_status: 'failed', last_run_at: '2 hours ago', total_runs: 31 },
    { id: '4', name: 'Deploy to Production', steps_count: 6, last_run_status: 'success', last_run_at: '1 day ago', total_runs: 8 },
  ]

  const items = pipelines ?? placeholder

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
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Pipelines</h2>
            <p className='text-muted-foreground'>
              Pipeline configurations and recent runs.
            </p>
          </div>
        </div>

        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Steps</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Last Run At</TableHead>
                <TableHead className='text-right'>Total Runs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((p) => (
                <TableRow
                  key={p.id}
                  className='cursor-pointer'
                  onClick={() => navigate({ to: '/pipelines/$pipelineId', params: { pipelineId: p.id } })}
                >
                  <TableCell className='font-medium'>{p.name}</TableCell>
                  <TableCell>{p.steps_count}</TableCell>
                  <TableCell>
                    {p.last_run_status ? (
                      <Badge variant='outline' className={statusColors[p.last_run_status] ?? ''}>
                        {p.last_run_status}
                      </Badge>
                    ) : (
                      <span className='text-muted-foreground'>--</span>
                    )}
                  </TableCell>
                  <TableCell>{p.last_run_at ?? 'Never'}</TableCell>
                  <TableCell className='text-right'>{p.total_runs}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Main>
    </>
  )
}
