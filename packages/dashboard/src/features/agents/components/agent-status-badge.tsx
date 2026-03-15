import { Badge } from '@/components/ui/badge'

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' ; className: string }> = {
  idle: { label: 'Idle', variant: 'default', className: 'bg-green-500/10 text-green-600 border-green-500/20' },
  running: { label: 'Running', variant: 'default', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  error: { label: 'Error', variant: 'destructive', className: '' },
  paused: { label: 'Paused', variant: 'default', className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
  terminated: { label: 'Terminated', variant: 'secondary', className: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
  retired: { label: 'Retired', variant: 'secondary', className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  pending_approval: { label: 'Pending', variant: 'outline', className: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
}

interface AgentStatusBadgeProps {
  status: string
}

export function AgentStatusBadge({ status }: AgentStatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, variant: 'outline' as const, className: '' }
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  )
}
