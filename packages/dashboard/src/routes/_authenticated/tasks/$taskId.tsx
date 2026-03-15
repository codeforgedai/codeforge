import { createFileRoute } from '@tanstack/react-router'
import { TaskDetailPage } from '@/features/tasks-kanban/detail'

export const Route = createFileRoute('/_authenticated/tasks/$taskId')({
  component: TaskDetailPage,
})
