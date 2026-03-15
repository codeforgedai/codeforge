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
import { useApi } from '@/hooks/use-api'
import { CostChart } from './components/cost-chart'

interface BillingData {
  current_period_cost: number
  budget_limit: number
  cost_by_agent: Array<{ agent: string; cost: number }>
  daily_costs: Array<{ date: string; cost: number }>
}

export function Billing() {
  const { data: billing } = useApi<BillingData>('/billing')

  const placeholder: BillingData = {
    current_period_cost: 352.80,
    budget_limit: 1000,
    cost_by_agent: [
      { agent: 'backend-agent', cost: 145.20 },
      { agent: 'frontend-agent', cost: 98.50 },
      { agent: 'devops-agent', cost: 67.30 },
      { agent: 'qa-agent', cost: 42.10 },
    ],
    daily_costs: Array.from({ length: 15 }, (_, i) => ({
      date: `Mar ${i + 1}`,
      cost: Math.round((15 + Math.random() * 30) * 100) / 100,
    })),
  }

  const data = billing ?? placeholder

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
          <h2 className='text-2xl font-bold tracking-tight'>Billing</h2>
          <p className='text-muted-foreground'>
            Monitor costs and manage your budget.
          </p>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>Current Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                ${data.current_period_cost.toFixed(2)}
              </div>
              <p className='text-xs text-muted-foreground'>
                of ${data.budget_limit.toFixed(2)} budget
              </p>
              <div className='mt-2 h-2 w-full rounded-full bg-muted'>
                <div
                  className='h-2 rounded-full bg-primary'
                  style={{ width: `${Math.min((data.current_period_cost / data.budget_limit) * 100, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
          <Card className='sm:col-span-2 lg:col-span-2'>
            <CardHeader>
              <CardTitle className='text-sm font-medium'>Cost by Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {data.cost_by_agent.map((item) => (
                  <div key={item.agent} className='flex items-center justify-between'>
                    <span className='text-sm'>{item.agent}</span>
                    <div className='flex items-center gap-2'>
                      <div className='h-2 w-32 rounded-full bg-muted'>
                        <div
                          className='h-2 rounded-full bg-primary'
                          style={{ width: `${(item.cost / data.current_period_cost) * 100}%` }}
                        />
                      </div>
                      <span className='text-sm font-medium w-16 text-right'>
                        ${item.cost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daily Cost Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <CostChart data={data.daily_costs} />
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
