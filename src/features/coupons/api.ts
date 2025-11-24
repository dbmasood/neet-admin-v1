import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import {
  type Coupon,
  type CouponCreateRequest,
  type CouponUpdateRequest,
} from '@/types/admin'

const couponsKeys = {
  all: ['admin', 'coupons'] as const,
  detail: (id: string) => ['admin', 'coupons', id] as const,
}

const fetchCoupons = async () => {
  const response = await apiClient.get<Coupon[]>('/admin/coupons')
  return response.data
}

const createCoupon = async (payload: CouponCreateRequest) => {
  const response = await apiClient.post<Coupon>('/admin/coupons', payload)
  return response.data
}

const updateCoupon = async ({
  id,
  payload,
}: {
  id: string
  payload: CouponUpdateRequest
}) => {
  const response = await apiClient.patch<Coupon>(
    `/admin/coupons/${id}`,
    payload
  )
  return response.data
}

const deleteCoupon = async (id: string) => {
  await apiClient.delete(`/admin/coupons/${id}`)
}

export const useCouponsQuery = () =>
  useQuery({
    queryKey: couponsKeys.all,
    queryFn: fetchCoupons,
  })

export const useCreateCouponMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponsKeys.all })
    },
  })
}

export const useUpdateCouponMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateCoupon,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: couponsKeys.all })
      queryClient.invalidateQueries({
        queryKey: couponsKeys.detail(variables.id),
      })
    },
  })
}

export const useDeleteCouponMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponsKeys.all })
    },
  })
}
