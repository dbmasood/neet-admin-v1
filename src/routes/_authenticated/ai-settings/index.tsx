import { createFileRoute } from '@tanstack/react-router'
import { AISettingsPage } from '@/features/ai-settings'

export const Route = createFileRoute('/_authenticated/ai-settings/')({
  component: AISettingsPage,
})
