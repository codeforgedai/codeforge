import { createFileRoute } from '@tanstack/react-router'
import { SettingsCredentials } from '@/features/settings/credentials'

export const Route = createFileRoute('/_authenticated/settings/credentials')({
  component: SettingsCredentials,
})
