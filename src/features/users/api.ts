import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import {
  type AdminBulkDeleteRequest,
  type AdminBulkDeleteResponse,
  type AdminBulkStatusRequest,
  type AdminBulkStatusResponse,
  type AdminInviteRequest,
  type AdminInviteResponse,
  type AdminUser,
  type AdminUserCreateRequest,
  type AdminUserList,
  type AdminUserUpdateRequest,
} from '@/types/admin'

export type AdminUsersFilters = {
  page?: number
  pageSize?: number
  status?: string[]
  role?: string[]
  username?: string
}

const usersKeys = {
  all: ['admin', 'users'] as const,
  list: (filters: AdminUsersFilters) =>
    ['admin', 'users', filters] as const,
}

const fetchAdminUsers = async (filters: AdminUsersFilters) => {
  const params: Record<string, string | number> = {}
  if (filters.page) params.page = filters.page
  if (filters.pageSize) params.pageSize = filters.pageSize
  if (filters.username) params.username = filters.username
  if (filters.status && filters.status.length > 0) {
    params.status = filters.status.join(',')
  }
  if (filters.role && filters.role.length > 0) {
    params.role = filters.role[0]
  }

  const response = await apiClient.get<AdminUserList>('/admin/users', {
    params,
  })
  return response.data
}

const createAdminUser = async (payload: AdminUserCreateRequest) => {
  const response = await apiClient.post<AdminUser>('/admin/users', payload)
  return response.data
}

const updateAdminUser = async ({
  id,
  payload,
}: {
  id: string
  payload: AdminUserUpdateRequest
}) => {
  const response = await apiClient.patch<AdminUser>(
    `/admin/users/${id}`,
    payload
  )
  return response.data
}

const deleteAdminUser = async (id: string) => {
  await apiClient.delete(`/admin/users/${id}`)
}

const bulkStatusUpdate = async (payload: AdminBulkStatusRequest) => {
  const response = await apiClient.post<AdminBulkStatusResponse>(
    '/admin/users/bulk-status',
    payload
  )
  return response.data
}

const bulkDeleteUsers = async (payload: AdminBulkDeleteRequest) => {
  const response = await apiClient.post<AdminBulkDeleteResponse>(
    '/admin/users/bulk-delete',
    payload
  )
  return response.data
}

const inviteAdminUser = async (payload: AdminInviteRequest) => {
  const response = await apiClient.post<AdminInviteResponse>(
    '/admin/users/invite',
    payload
  )
  return response.data
}

export const useAdminUsersQuery = (filters: AdminUsersFilters) =>
  useQuery({
    queryKey: usersKeys.list(filters),
    queryFn: () => fetchAdminUsers(filters),
  })

export const useCreateAdminUserMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all })
    },
  })
}

export const useUpdateAdminUserMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all })
    },
  })
}

export const useDeleteAdminUserMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all })
    },
  })
}

export const useBulkStatusUpdateMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: bulkStatusUpdate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all })
    },
  })
}

export const useBulkDeleteUsersMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: bulkDeleteUsers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all })
    },
  })
}

export const useInviteAdminUserMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: inviteAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all })
    },
  })
}
