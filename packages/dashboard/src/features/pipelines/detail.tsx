import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useRunStream } from '@/hooks/use-run-stream'
import { PipelineLiveView } from './components/pipeline-live-view'

const route = getRouteApi('/_authenticated/pipelines/$pipelineId')

export function PipelineDetailPage() {
  const { pipelineId } = route.useParams()
  const { events, connected, done } = useRunStream({
    runId: pipelineId,
    enabled: true,
  })

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
            Pipeline Run: {pipelineId}
          </h2>
          {done && (
            <span className='text-sm text-muted-foreground'>(completed)</span>
          )}
        </div>

        <PipelineLiveView events={events} connected={connected} />
      </Main>
    </>
  )
}
