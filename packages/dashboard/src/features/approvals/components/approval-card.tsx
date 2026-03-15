import { CheckCircle, Clock, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { apiFetch } from '@/lib/api-client'

const typeLabels: Record<string, string> = {
  hire_agent: 'Hire Agent',
  budget_change: 'Budget Change',
  deploy: 'Deployment',
  custom: 'Custom',
}

const statusConfig: Record<string, { icon: React.ElementType; className: string }> = {
  pending: { icon: Clock, className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
  approved: { icon: CheckCircle, className: 'bg-green-500/10 text-green-600 border-green-500/20' },
  rejected: { icon: XCircle, className: 'bg-red-500/10 text-red-600 border-red-500/20' },
  expired: { icon: Clock, className: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
}

interface ApprovalCardProps {
  approval: {
    id: string
    type: string
    title: string
    requester: string
    description: string
    status: string
    created_at: string
  }
}

export function ApprovalCard({ approval }: ApprovalCardProps) {
  const config = statusConfig[approval.status] ?? statusConfig.pending
  const StatusIcon = config.icon

  async function handleAction(action: 'approve' | 'reject') {
    try {
      await apiFetch(`/approvals/${approval.id}/${action}`, { method: 'POST' })
      window.location.reload()
    } catch {
      // handled by api-client
    }
  }

  return (
    <Card>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-sm font-medium'>{approval.title}</CardTitle>
          <Badge variant='outline' className={config.className}>
            <StatusIcon className='mr-1 h-3 w-3' />
            {approval.status}
          </Badge>
        </div>
        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          <Badge variant='secondary'>{typeLabels[approval.type] ?? approval.type}</Badge>
          <span>by {approval.requester}</span>
          <span>{approval.created_at}</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className='text-sm text-muted-foreground'>{approval.description}</p>
      </CardContent>
      {approval.status === 'pending' && (
        <CardFooter className='gap-2'>
          <Button size='sm' onClick={() => handleAction('approve')}>
            Approve
          </Button>
          <Button size='sm' variant='outline' onClick={() => handleAction('reject')}>
            Reject
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
