import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useApi } from '@/hooks/use-api'
import { ApprovalCard } from './components/approval-card'

interface Approval {
  id: string
  type: string
  title: string
  requester: string
  description: string
  status: string
  created_at: string
}

const placeholderApprovals: Approval[] = [
  { id: '1', type: 'hire_agent', title: 'Hire ML Engineer Agent', requester: 'architect-agent', description: 'Need ML specialist for recommendation engine work. Estimated monthly cost: $200.', status: 'pending', created_at: '10 min ago' },
  { id: '2', type: 'budget_change', title: 'Increase backend-agent budget', requester: 'backend-agent', description: 'Requesting $50/month increase to handle additional API development work.', status: 'pending', created_at: '1 hour ago' },
  { id: '3', type: 'deploy', title: 'Deploy auth service to production', requester: 'devops-agent', description: 'All tests passing. Ready for production deployment.', status: 'pending', created_at: '3 hours ago' },
  { id: '4', type: 'custom', title: 'Use external API for geocoding', requester: 'backend-agent', description: 'Requesting approval to integrate Google Maps API for address validation.', status: 'approved', created_at: '1 day ago' },
]

export function Approvals() {
  const { data: approvals } = useApi<Approval[]>('/approvals')
  const items = approvals ?? placeholderApprovals

  const pending = items.filter((a) => a.status === 'pending')
  const resolved = items.filter((a) => a.status !== 'pending')

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
          <h2 className='text-2xl font-bold tracking-tight'>Approvals</h2>
          <p className='text-muted-foreground'>
            Review and approve agent requests.
          </p>
        </div>

        {pending.length > 0 && (
          <div>
            <h3 className='text-lg font-semibold mb-3'>Pending ({pending.length})</h3>
            <div className='grid gap-4 md:grid-cols-2'>
              {pending.map((a) => (
                <ApprovalCard key={a.id} approval={a} />
              ))}
            </div>
          </div>
        )}

        {resolved.length > 0 && (
          <div>
            <h3 className='text-lg font-semibold mb-3'>Resolved</h3>
            <div className='grid gap-4 md:grid-cols-2'>
              {resolved.map((a) => (
                <ApprovalCard key={a.id} approval={a} />
              ))}
            </div>
          </div>
        )}
      </Main>
    </>
  )
}
