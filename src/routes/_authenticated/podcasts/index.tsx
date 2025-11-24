import { createFileRoute } from '@tanstack/react-router'
import { PodcastsPage } from '@/features/podcasts'

export const Route = createFileRoute('/_authenticated/podcasts/')({
  component: PodcastsPage,
})
