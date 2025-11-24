import { createFileRoute } from '@tanstack/react-router'
import { SubjectsPage } from '@/features/subjects'

export const Route = createFileRoute('/_authenticated/subjects/')({
  component: SubjectsPage,
})
