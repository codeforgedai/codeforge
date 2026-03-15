import { createFileRoute } from '@tanstack/react-router'
import { PipelineDetailPage } from '@/features/pipelines/detail'

export const Route = createFileRoute('/_authenticated/pipelines/$pipelineId')({
  component: PipelineDetailPage,
})
