import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useApi } from '@/hooks/use-api'
import { ContentSection } from '../components/content-section'

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  status: string
}

const placeholder: TeamMember[] = [
  { id: '1', name: 'James', email: 'james@codeforce.dev', role: 'owner', status: 'active' },
  { id: '2', name: 'Alice', email: 'alice@codeforce.dev', role: 'admin', status: 'active' },
  { id: '3', name: 'Bob', email: 'bob@example.com', role: 'member', status: 'invited' },
]

const roleColors: Record<string, string> = {
  owner: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  admin: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  member: 'bg-green-500/10 text-green-600 border-green-500/20',
  viewer: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
}

export function SettingsTeam() {
  const { data: members } = useApi<TeamMember[]>('/settings/team')
  const items = members ?? placeholder

  return (
    <ContentSection
      title='Team Members'
      desc='Manage who has access to this organization.'
    >
      <div className='space-y-4'>
        <div className='flex justify-end'>
          <Button size='sm'>Invite Member</Button>
        </div>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className='font-medium'>{m.name}</TableCell>
                  <TableCell>{m.email}</TableCell>
                  <TableCell>
                    <Badge variant='outline' className={roleColors[m.role] ?? ''}>
                      {m.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={m.status === 'active' ? 'default' : 'secondary'}>
                      {m.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </ContentSection>
  )
}
