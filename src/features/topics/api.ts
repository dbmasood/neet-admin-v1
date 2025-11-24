import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import {
  type AdminTopicCreateRequest,
  type Topic,
} from '@/types/admin'

const topicsKeys = {
  all: ['admin', 'topics'] as const,
  bySubject: (subjectId?: string) =>
    ['admin', 'topics', subjectId ?? 'all'] as const,
}

const fetchTopics = async (subjectId?: string) => {
  const response = await apiClient.get<Topic[]>('/admin/topics', {
    params: subjectId ? { subjectId } : undefined,
  })
  return response.data
}

const createTopic = async (payload: AdminTopicCreateRequest) => {
  const response = await apiClient.post<Topic>('/admin/topics', payload)
  return response.data
}

export const useTopicsQuery = (subjectId?: string) =>
  useQuery({
    queryKey: topicsKeys.bySubject(subjectId),
    queryFn: () => fetchTopics(subjectId),
  })

export const useCreateTopicMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTopic,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: topicsKeys.all })
      queryClient.invalidateQueries({
        queryKey: topicsKeys.bySubject(variables.subjectId),
      })
    },
  })
}
