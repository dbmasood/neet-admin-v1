import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { type AnalyticsOverview } from '@/types/admin'

export type AnalyticsFilters = {
  exam?: string
  range?: string
}

const analyticsKeys = {
  overview: (filters: AnalyticsFilters) =>
    ['admin', 'analytics-overview', filters] as const,
}

const fetchAnalyticsOverview = async (filters: AnalyticsFilters) => {
  const response = await apiClient.get<AnalyticsOverview>(
    '/admin/analytics/overview',
    {
      params: filters,
    }
  )
  return response.data
}

export const useAnalyticsOverviewQuery = (filters: AnalyticsFilters) =>
  useQuery({
    queryKey: analyticsKeys.overview(filters),
    queryFn: () => fetchAnalyticsOverview(filters),
  })
