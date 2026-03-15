import { createFileRoute } from '@tanstack/react-router'
import { AgentDetailPage } from '@/features/agents/detail'

export const Route = createFileRoute('/_authenticated/agents/$agentId')({
  component: AgentDetailPage,
})
