import {
  useMutation,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import {
  type AdminLoginRequest,
  type AdminProfile,
  type AuthResponse,
} from '@/types/admin'

const adminLogin = async (payload: AdminLoginRequest) => {
  const response = await apiClient.post<AuthResponse>(
    '/auth/admin/login',
    payload
  )
  return response.data
}

export const useAdminLoginMutation = () =>
  useMutation({
    mutationFn: adminLogin,
  })

export const adminProfileQueryKey = ['admin', 'profile'] as const

export const fetchAdminProfile = async () => {
  const response = await apiClient.get<AdminProfile>('/auth/admin/me')
  return response.data
}

export const useAdminProfileQuery = (
  options?: Omit<
    UseQueryOptions<AdminProfile>,
    'queryKey' | 'queryFn'
  >
) =>
  useQuery({
    queryKey: adminProfileQueryKey,
    queryFn: fetchAdminProfile,
    ...options,
  })
