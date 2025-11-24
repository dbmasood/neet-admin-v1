import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { type AISettings } from '@/types/admin'

const aiSettingsKey = ['admin', 'ai-settings'] as const

const fetchAISettings = async () => {
  const response = await apiClient.get<AISettings>('/admin/ai-settings')
  return response.data
}

const updateAISettings = async (payload: AISettings) => {
  const response = await apiClient.put<AISettings>(
    '/admin/ai-settings',
    payload
  )
  return response.data
}

export const useAISettingsQuery = () =>
  useQuery({
    queryKey: aiSettingsKey,
    queryFn: fetchAISettings,
  })

export const useUpdateAISettingsMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateAISettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiSettingsKey })
    },
  })
}
