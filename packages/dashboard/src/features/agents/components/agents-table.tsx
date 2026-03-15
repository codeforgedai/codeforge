import { useNavigate } from '@tanstack/react-router'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useApi } from '@/hooks/use-api'
import { AgentStatusBadge } from './agent-status-badge'

interface Agent {
  id: string
  name: string
  role: string
  status: string
  model: string
  last_heartbeat: string | null
  monthly_cost_usd: number
}

export function AgentsTable() {
  const { data: agents, loading } = useApi<Agent[]>('/agents')
  const navigate = useNavigate()

  const placeholder: Agent[] = [
    { id: '1', name: 'backend-agent', role: 'Backend Engineer', status: 'running', model: 'claude-sonnet-4-20250514', last_heartbeat: '2 min ago', monthly_cost_usd: 145.20 },
    { id: '2', name: 'frontend-agent', role: 'Frontend Engineer', status: 'idle', model: 'claude-sonnet-4-20250514', last_heartbeat: '5 min ago', monthly_cost_usd: 98.50 },
    { id: '3', name: 'devops-agent', role: 'DevOps Engineer', status: 'paused', model: 'gpt-4o', last_heartbeat: '1 hour ago', monthly_cost_usd: 67.30 },
    { id: '4', name: 'qa-agent', role: 'QA Engineer', status: 'error', model: 'claude-sonnet-4-20250514', last_heartbeat: '30 min ago', monthly_cost_usd: 42.10 },
    { id: '5', name: 'architect-agent', role: 'Architect', status: 'terminated', model: 'claude-opus-4-20250514', last_heartbeat: null, monthly_cost_usd: 0 },
  ]

  const items = agents ?? placeholder

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Last Heartbeat</TableHead>
            <TableHead className='text-right'>Monthly Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className='text-center py-8 text-muted-foreground'>
                Loading agents...
              </TableCell>
            </TableRow>
          ) : (
            items.map((agent) => (
              <TableRow
                key={agent.id}
                className='cursor-pointer'
                onClick={() => navigate({ to: '/agents/$agentId', params: { agentId: agent.id } })}
              >
                <TableCell className='font-medium'>{agent.name}</TableCell>
                <TableCell>{agent.role}</TableCell>
                <TableCell>
                  <AgentStatusBadge status={agent.status} />
                </TableCell>
                <TableCell className='font-mono text-xs'>{agent.model}</TableCell>
                <TableCell>{agent.last_heartbeat ?? 'Never'}</TableCell>
                <TableCell className='text-right'>${agent.monthly_cost_usd.toFixed(2)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
