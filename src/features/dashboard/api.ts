import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import {
  type AdminEventsResponse,
  type AdminReferralSummary,
  type AnalyticsOverview,
  type AnalyticsTimeSeries,
  type SubjectAccuracyResponse,
  type WeakTopicsResponse,
} from '@/types/admin'

export type AnalyticsFilters = {
  exam?: string
  range?: 'today' | '7d' | '30d'
}

export type AnalyticsMetric = 'active_users' | 'questions_answered'

export type AnalyticsTimeSeriesFilters = AnalyticsFilters & {
  metric: AnalyticsMetric
}

export type WeakTopicsFilters = {
  exam?: string
  limit?: number
}

const analyticsKeys = {
  overview: (filters: AnalyticsFilters) =>
    ['admin', 'analytics-overview', filters] as const,
  timeSeries: (filters: AnalyticsTimeSeriesFilters) =>
    ['admin', 'analytics-time-series', filters] as const,
  subjectAccuracy: (filters: { exam?: string }) =>
    ['admin', 'subject-accuracy', filters] as const,
  weakTopics: (filters: WeakTopicsFilters) =>
    ['admin', 'weak-topics', filters] as const,
  events: (filters: { exam?: string }) =>
    ['admin', 'events', filters] as const,
  referrals: (filters: { range?: 'today' | '7d' | '30d' }) =>
    ['admin', 'referrals', filters] as const,
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

const fetchAnalyticsTimeSeries = async (
  filters: AnalyticsTimeSeriesFilters
) => {
  const response = await apiClient.get<AnalyticsTimeSeries>(
    '/admin/analytics/time-series',
    {
      params: filters,
    }
  )
  return response.data
}

const fetchSubjectAccuracy = async (filters: { exam?: string }) => {
  const response = await apiClient.get<SubjectAccuracyResponse>(
    '/admin/analytics/subject-accuracy',
    {
      params: filters,
    }
  )
  return response.data
}

const fetchWeakTopics = async (filters: WeakTopicsFilters) => {
  const response = await apiClient.get<WeakTopicsResponse>(
    '/admin/analytics/weak-topics',
    {
      params: filters,
    }
  )
  return response.data
}

const fetchUpcomingEvents = async (filters: { exam?: string }) => {
  const response = await apiClient.get<AdminEventsResponse>(
    '/admin/events/upcoming',
    {
      params: filters,
    }
  )
  return response.data
}

const fetchReferralSummary = async (filters: {
  range?: 'today' | '7d' | '30d'
}) => {
  const response = await apiClient.get<AdminReferralSummary>(
    '/admin/referrals/summary',
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

export const useAnalyticsTimeSeriesQuery = (
  filters: AnalyticsTimeSeriesFilters
) =>
  useQuery({
    queryKey: analyticsKeys.timeSeries(filters),
    queryFn: () => fetchAnalyticsTimeSeries(filters),
    enabled: Boolean(filters.metric),
  })

export const useSubjectAccuracyQuery = (filters: { exam?: string }) =>
  useQuery({
    queryKey: analyticsKeys.subjectAccuracy(filters),
    queryFn: () => fetchSubjectAccuracy(filters),
  })

export const useWeakTopicsQuery = (filters: WeakTopicsFilters) =>
  useQuery({
    queryKey: analyticsKeys.weakTopics(filters),
    queryFn: () => fetchWeakTopics(filters),
  })

export const useUpcomingEventsQuery = (filters: { exam?: string }) =>
  useQuery({
    queryKey: analyticsKeys.events(filters),
    queryFn: () => fetchUpcomingEvents(filters),
  })

export const useReferralSummaryQuery = (filters: {
  range?: 'today' | '7d' | '30d'
}) =>
  useQuery({
    queryKey: analyticsKeys.referrals(filters),
    queryFn: () => fetchReferralSummary(filters),
  })
