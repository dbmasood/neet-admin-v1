import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import {
  type ExamConfig,
  type ExamConfigCreateRequest,
  type ExamConfigUpdateRequest,
} from '@/types/admin'

export type ExamFilters = {
  exam?: string
}

const examConfigKeys = {
  all: ['admin', 'exams'] as const,
  list: (filters: ExamFilters) => ['admin', 'exams', filters] as const,
  detail: (id: string) => ['admin', 'exams', id] as const,
}

const fetchExamConfigs = async (filters: ExamFilters) => {
  const response = await apiClient.get<ExamConfig[]>('/admin/exams', {
    params: filters.exam ? { exam: filters.exam } : undefined,
  })
  return response.data
}

const createExamConfig = async (payload: ExamConfigCreateRequest) => {
  const response = await apiClient.post<ExamConfig>('/admin/exams', payload)
  return response.data
}

const updateExamConfig = async ({
  id,
  payload,
}: {
  id: string
  payload: ExamConfigUpdateRequest
}) => {
  const response = await apiClient.patch<ExamConfig>(
    `/admin/exams/${id}`,
    payload
  )
  return response.data
}

const deleteExamConfig = async (id: string) => {
  await apiClient.delete(`/admin/exams/${id}`)
}

export const useExamConfigsQuery = (filters: ExamFilters) =>
  useQuery({
    queryKey: examConfigKeys.list(filters),
    queryFn: () => fetchExamConfigs(filters),
  })

export const useCreateExamConfigMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createExamConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examConfigKeys.all })
    },
  })
}

export const useUpdateExamConfigMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateExamConfig,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: examConfigKeys.all })
      queryClient.invalidateQueries({
        queryKey: examConfigKeys.detail(variables.id),
      })
    },
  })
}

export const useDeleteExamConfigMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteExamConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examConfigKeys.all })
    },
  })
}
