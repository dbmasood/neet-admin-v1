import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import {
  type AdminSubjectCreateRequest,
  type Subject,
} from '@/types/admin'

const subjectsKeys = {
  all: ['admin', 'subjects'] as const,
}

const fetchSubjects = async () => {
  const response = await apiClient.get<Subject[]>('/admin/subjects')
  return response.data
}

const createSubject = async (payload: AdminSubjectCreateRequest) => {
  const response = await apiClient.post<Subject>('/admin/subjects', payload)
  return response.data
}

export const useSubjectsQuery = () =>
  useQuery({
    queryKey: subjectsKeys.all,
    queryFn: fetchSubjects,
  })

export const useCreateSubjectMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subjectsKeys.all })
    },
  })
}
