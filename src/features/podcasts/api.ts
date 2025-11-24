import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import {
  type PodcastCreateRequest,
  type PodcastEpisode,
} from '@/types/admin'

const podcastsKeys = {
  all: ['admin', 'podcasts'] as const,
  detail: (id: string) => ['admin', 'podcasts', id] as const,
}

const fetchPodcasts = async () => {
  const response = await apiClient.get<PodcastEpisode[]>('/admin/podcasts')
  return response.data
}

const createPodcast = async (payload: PodcastCreateRequest) => {
  const response = await apiClient.post<PodcastEpisode>(
    '/admin/podcasts',
    payload
  )
  return response.data
}

const updatePodcast = async ({
  id,
  payload,
}: {
  id: string
  payload: PodcastCreateRequest
}) => {
  const response = await apiClient.patch<PodcastEpisode>(
    `/admin/podcasts/${id}`,
    payload
  )
  return response.data
}

const deletePodcast = async (id: string) => {
  await apiClient.delete(`/admin/podcasts/${id}`)
}

export const usePodcastsQuery = () =>
  useQuery({
    queryKey: podcastsKeys.all,
    queryFn: fetchPodcasts,
  })

export const useCreatePodcastMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createPodcast,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: podcastsKeys.all })
    },
  })
}

export const useUpdatePodcastMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updatePodcast,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: podcastsKeys.all })
      queryClient.invalidateQueries({
        queryKey: podcastsKeys.detail(variables.id),
      })
    },
  })
}

export const useDeletePodcastMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deletePodcast,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: podcastsKeys.all })
    },
  })
}
