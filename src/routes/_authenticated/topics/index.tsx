import { createFileRoute } from '@tanstack/react-router'
import { TopicsPage } from '@/features/topics'

export const Route = createFileRoute('/_authenticated/topics/')({
  component: TopicsPage,
})
