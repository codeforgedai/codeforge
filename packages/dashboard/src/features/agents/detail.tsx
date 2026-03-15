import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useApi } from '@/hooks/use-api'
import { AgentStatusBadge } from './components/agent-status-badge'

const route = getRouteApi('/_authenticated/agents/$agentId')

interface AgentDetail {
  id: string
  name: string
  role: string
  status: string
  model: string
  system_prompt: string
  monthly_cost_usd: number
  total_runs: number
  memory_entries: number
}

export function AgentDetailPage() {
  const { agentId } = route.useParams()
  const { data: agent } = useApi<AgentDetail>(`/agents/${agentId}`)

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
            {agent?.name ?? agentId}
          </h2>
          {agent && <AgentStatusBadge status={agent.status} />}
        </div>

        <Tabs defaultValue='config' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='config'>Config</TabsTrigger>
            <TabsTrigger value='runs'>Runs</TabsTrigger>
            <TabsTrigger value='memory'>Memory</TabsTrigger>
            <TabsTrigger value='cost'>Cost Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value='config' className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-sm font-medium'>Role</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{agent?.role ?? '--'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className='text-sm font-medium'>Model</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='font-mono text-sm'>{agent?.model ?? '--'}</p>
                </CardContent>
              </Card>
              <Card className='md:col-span-2'>
                <CardHeader>
                  <CardTitle className='text-sm font-medium'>System Prompt</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className='whitespace-pre-wrap text-sm text-muted-foreground'>
                    {agent?.system_prompt ?? 'No system prompt configured.'}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value='runs' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>Recent Runs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground'>
                  {agent?.total_runs ?? 0} total runs recorded.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='memory' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>Memory Store</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground'>
                  {agent?.memory_entries ?? 0} memory entries stored.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='cost' className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-sm font-medium'>Monthly Cost</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    ${agent?.monthly_cost_usd?.toFixed(2) ?? '0.00'}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
