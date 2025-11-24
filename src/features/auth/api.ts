import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { type AdminLoginRequest, type AuthResponse } from '@/types/admin'

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
