import { createFileRoute } from '@tanstack/react-router'
import { QuestionsPage } from '@/features/questions'

export const Route = createFileRoute('/_authenticated/questions/')({
  component: QuestionsPage,
})
