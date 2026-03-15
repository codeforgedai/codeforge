import { createFileRoute } from '@tanstack/react-router'
import { SettingsTeam } from '@/features/settings/team'

export const Route = createFileRoute('/_authenticated/settings/team')({
  component: SettingsTeam,
})
