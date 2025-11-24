import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import {
  type Question,
  type QuestionCreateRequest,
  type QuestionUpdateRequest,
} from '@/types/admin'

export type QuestionFilters = {
  exam?: string
  subjectId?: string
  topicId?: string
}

const questionsKeys = {
  all: ['admin', 'questions'] as const,
  list: (filters: QuestionFilters) => ['admin', 'questions', filters] as const,
  detail: (id: string) => ['admin', 'questions', id] as const,
}

const fetchQuestions = async (filters: QuestionFilters) => {
  const response = await apiClient.get<Question[]>('/admin/questions', {
    params: filters,
  })
  return response.data
}

const createQuestion = async (payload: QuestionCreateRequest) => {
  const response = await apiClient.post<Question>('/admin/questions', payload)
  return response.data
}

const updateQuestion = async ({
  id,
  payload,
}: {
  id: string
  payload: QuestionUpdateRequest
}) => {
  const response = await apiClient.patch<Question>(
    `/admin/questions/${id}`,
    payload
  )
  return response.data
}

const deleteQuestion = async (id: string) => {
  await apiClient.delete(`/admin/questions/${id}`)
}

export const useQuestionsQuery = (filters: QuestionFilters) =>
  useQuery({
    queryKey: questionsKeys.list(filters),
    queryFn: () => fetchQuestions(filters),
  })

export const useCreateQuestionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionsKeys.all })
    },
  })
}

export const useUpdateQuestionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateQuestion,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: questionsKeys.all })
      if (variables.id) {
        queryClient.invalidateQueries({
          queryKey: questionsKeys.detail(variables.id),
        })
      }
    },
  })
}

export const useDeleteQuestionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionsKeys.all })
    },
  })
}
