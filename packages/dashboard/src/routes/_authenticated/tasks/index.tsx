import { createFileRoute } from '@tanstack/react-router'
import { TasksKanban } from '@/features/tasks-kanban'

export const Route = createFileRoute('/_authenticated/tasks/')({
  component: TasksKanban,
})
