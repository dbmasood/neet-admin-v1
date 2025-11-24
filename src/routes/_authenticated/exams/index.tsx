import { createFileRoute } from '@tanstack/react-router'
import { ExamsPage } from '@/features/exams'

export const Route = createFileRoute('/_authenticated/exams/')({
  component: ExamsPage,
})
