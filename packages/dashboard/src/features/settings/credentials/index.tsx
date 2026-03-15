import { Eye, EyeOff, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useApi } from '@/hooks/use-api'
import { ContentSection } from '../components/content-section'

interface Credential {
  id: string
  name: string
  type: string
  masked_value: string
  created_at: string
}

const placeholder: Credential[] = [
  { id: '1', name: 'ANTHROPIC_API_KEY', type: 'api_key', masked_value: 'sk-ant-***...abc', created_at: 'Mar 1, 2026' },
  { id: '2', name: 'OPENAI_API_KEY', type: 'api_key', masked_value: 'sk-***...xyz', created_at: 'Mar 5, 2026' },
  { id: '3', name: 'GITHUB_TOKEN', type: 'token', masked_value: 'ghp_***...def', created_at: 'Mar 10, 2026' },
]

export function SettingsCredentials() {
  const { data: credentials } = useApi<Credential[]>('/settings/credentials')
  const items = credentials ?? placeholder
  const [revealed, setRevealed] = useState<Set<string>>(new Set())

  function toggleReveal(id: string) {
    setRevealed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <ContentSection
      title='Credentials'
      desc='API keys and tokens used by your agents.'
    >
      <div className='space-y-4'>
        <div className='flex justify-end'>
          <Button size='sm'>Add Credential</Button>
        </div>
        <div className='space-y-3'>
          {items.map((cred) => (
            <Card key={cred.id}>
              <CardHeader className='pb-2'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-sm font-medium'>{cred.name}</CardTitle>
                  <div className='flex items-center gap-2'>
                    <Badge variant='secondary'>{cred.type}</Badge>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7'
                      onClick={() => toggleReveal(cred.id)}
                    >
                      {revealed.has(cred.id) ? (
                        <EyeOff className='h-3.5 w-3.5' />
                      ) : (
                        <Eye className='h-3.5 w-3.5' />
                      )}
                    </Button>
                    <Button variant='ghost' size='icon' className='h-7 w-7 text-destructive'>
                      <Trash2 className='h-3.5 w-3.5' />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className='flex items-center justify-between'>
                  <code className='text-xs bg-muted px-2 py-1 rounded'>
                    {revealed.has(cred.id) ? cred.masked_value : cred.masked_value.replace(/[^.*]/g, '*')}
                  </code>
                  <span className='text-xs text-muted-foreground'>
                    Added {cred.created_at}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ContentSection>
  )
}
