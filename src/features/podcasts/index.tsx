import { useEffect, useMemo, useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { z } from 'zod'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SelectDropdown } from '@/components/select-dropdown'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { ConfigDrawer } from '@/components/config-drawer'
import { ExamSelector } from '@/components/exam-selector'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { examCategoryOptions } from '@/constants/exams'
import { useCurrentExam } from '@/stores/exam-store'
import { useSubjectsQuery } from '@/features/subjects/api'
import { useTopicsQuery } from '@/features/topics/api'
import {
  useCreatePodcastMutation,
  useDeletePodcastMutation,
  usePodcastsQuery,
  useUpdatePodcastMutation,
} from './api'
import {
  examCategoryLabels,
  type PodcastCreateRequest,
  type PodcastEpisode,
  type Subject,
} from '@/types/admin'

const podcastSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  audioUrl: z.string().url('Audio URL must be valid'),
  exam: z.string().min(1, 'Exam is required'),
  subjectId: z.string().optional(),
  topicId: z.string().optional(),
  description: z.string().optional(),
  durationSeconds: z.string().optional(),
  tags: z.string().optional(),
  isActive: z.boolean(),
})

type PodcastFormValues = z.infer<typeof podcastSchema>

type PodcastFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultExam?: string
  initialPodcast?: PodcastEpisode | null
  subjects: Subject[]
}

export function PodcastsPage() {
  const { exam } = useCurrentExam()
  const [formOpen, setFormOpen] = useState(false)
  const [editingPodcast, setEditingPodcast] = useState<PodcastEpisode | null>(
    null
  )
  const [deleteTarget, setDeleteTarget] = useState<PodcastEpisode | null>(null)

  const { data: podcasts, isLoading } = usePodcastsQuery()
  const { data: subjects } = useSubjectsQuery()
  const { mutateAsync: deletePodcast, isPending: isDeleting } =
    useDeletePodcastMutation()

  const filteredPodcasts = useMemo(() => {
    if (!podcasts) return []
    if (exam === 'ALL') return podcasts
    return podcasts.filter((podcast) => podcast.exam === exam)
  }, [podcasts, exam])

  const subjectMap = useMemo(() => {
    const map = new Map<string, Subject>()
    subjects?.forEach((subject) => map.set(subject.id, subject))
    return map
  }, [subjects])

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deletePodcast(deleteTarget.id)
    toast.success('Podcast deleted')
    setDeleteTarget(null)
  }

  return (
    <>
      <Header fixed>
        <ExamSelector />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Podcasts</h2>
            <p className='text-muted-foreground'>
              Curate the short-form audio lessons and stories for learners.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingPodcast(null)
              setFormOpen(true)
            }}
          >
            <Plus className='me-2 size-4' />
            New episode
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Episodes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='flex items-center gap-2 text-muted-foreground'>
                <Loader2 className='size-4 animate-spin' />
                Loading podcasts...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Exam</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!filteredPodcasts.length ? (
                    <TableRow>
                      <TableCell colSpan={6} className='text-center'>
                        No podcasts yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPodcasts.map((episode) => {
                      const subject = episode.subjectId
                        ? subjectMap.get(episode.subjectId)
                        : null
                      return (
                        <TableRow key={episode.id}>
                          <TableCell>
                            <div>
                              <p className='font-medium'>{episode.title}</p>
                              <p className='text-xs text-muted-foreground'>
                                {episode.description ?? 'No description'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {episode.exam
                              ? examCategoryLabels[episode.exam]
                              : '—'}
                          </TableCell>
                          <TableCell>{subject?.name ?? '—'}</TableCell>
                          <TableCell>
                            {episode.durationSeconds
                              ? `${Math.round(episode.durationSeconds / 60)} min`
                              : '—'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={episode.isActive ? 'default' : 'outline'}
                            >
                              {episode.isActive ? 'Published' : 'Draft'}
                            </Badge>
                          </TableCell>
                          <TableCell className='text-right space-x-2'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                setEditingPodcast(episode)
                                setFormOpen(true)
                              }}
                            >
                              <Pencil className='me-1 size-4' />
                              Edit
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='text-destructive'
                              onClick={() => setDeleteTarget(episode)}
                            >
                              <Trash2 className='me-1 size-4' />
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Main>

      <PodcastForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingPodcast(null)
        }}
        defaultExam={exam === 'ALL' ? undefined : exam}
        initialPodcast={editingPodcast}
        subjects={subjects ?? []}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title='Delete podcast'
        desc='This will remove the selected podcast episode.'
        destructive
        isLoading={isDeleting}
        handleConfirm={handleDelete}
        confirmText='Delete'
      />
    </>
  )
}

function PodcastForm({
  open,
  onOpenChange,
  defaultExam,
  initialPodcast,
  subjects,
}: PodcastFormProps) {
  const isEditing = Boolean(initialPodcast)
  const { mutateAsync: createPodcast, isPending: isCreating } =
    useCreatePodcastMutation()
  const { mutateAsync: updatePodcast, isPending: isUpdating } =
    useUpdatePodcastMutation()

  const form = useForm<PodcastFormValues>({
    resolver: zodResolver(podcastSchema) as Resolver<PodcastFormValues>,
    defaultValues: {
      title: '',
      audioUrl: '',
      exam: defaultExam ?? '',
      subjectId: '',
      topicId: '',
      description: '',
      durationSeconds: '',
      tags: '',
      isActive: true,
    },
  })

  useEffect(() => {
    if (initialPodcast) {
      form.reset({
        title: initialPodcast.title,
        audioUrl: initialPodcast.audioUrl,
        exam: initialPodcast.exam ?? defaultExam ?? '',
        subjectId: initialPodcast.subjectId ?? '',
        topicId: initialPodcast.topicId ?? '',
        description: initialPodcast.description ?? '',
        durationSeconds: initialPodcast.durationSeconds
          ? `${initialPodcast.durationSeconds}`
          : '',
        tags: (initialPodcast.tags ?? []).join(', '),
        isActive: Boolean(initialPodcast.isActive),
      })
    } else {
      form.reset((prev) => ({
        ...prev,
        exam: defaultExam ?? '',
        subjectId: '',
        topicId: '',
        tags: '',
        isActive: true,
      }))
    }
  }, [initialPodcast, defaultExam, form])

  const subjectId = form.watch('subjectId')
  const { data: topics, isLoading: isTopicsLoading } = useTopicsQuery(
    subjectId || undefined
  )

  const onSubmit = async (values: PodcastFormValues) => {
    const payload: PodcastCreateRequest = {
      title: values.title,
      audioUrl: values.audioUrl,
      exam: values.exam as PodcastCreateRequest['exam'],
      subjectId: values.subjectId || undefined,
      topicId: values.topicId || undefined,
      description: values.description || undefined,
      isActive: values.isActive,
      durationSeconds: values.durationSeconds
        ? Number(values.durationSeconds)
        : undefined,
      tags: values.tags
        ? values.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean)
        : undefined,
    }

    if (isEditing && initialPodcast) {
      await updatePodcast({ id: initialPodcast.id, payload })
      toast.success('Podcast updated')
    } else {
      await createPodcast(payload)
      toast.success('Podcast created')
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto max-w-2xl'>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit podcast episode' : 'Create podcast episode'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder='Episode title' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='audioUrl'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Audio URL</FormLabel>
                  <FormControl>
                    <Input placeholder='https://cdn...' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='exam'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exam</FormLabel>
                  <FormControl>
                    <SelectDropdown
                      items={examCategoryOptions}
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select exam'
                      isControlled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='subjectId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <SelectDropdown
                        items={[
                          { label: 'Unassigned', value: '' },
                          ...subjects.map((subject) => ({
                            label: subject.name,
                            value: subject.id,
                          })),
                        ]}
                        defaultValue={field.value}
                        onValueChange={(value) => {
                          field.onChange(value)
                          form.setValue('topicId', '')
                        }}
                        placeholder='Select subject'
                        isControlled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='topicId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <SelectDropdown
                        isPending={isTopicsLoading}
                        items={[
                          { label: 'Unassigned', value: '' },
                          ...(topics ?? []).map((topic) => ({
                            label: topic.name,
                            value: topic.id,
                          })),
                        ]}
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder='Select topic'
                        isControlled
                        disabled={!subjectId}
                      />
                    </FormControl>
                    <FormDescription>
                      Topics are filtered by the selected subject.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder='Optional summary' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='durationSeconds'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (seconds)</FormLabel>
                    <FormControl>
                      <Input type='number' placeholder='e.g. 600' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='tags'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Comma separated tags'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Example: mindset, strategy, exam-day
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='isActive'
              render={({ field }) => (
                <FormItem className='flex items-center justify-between rounded-md border p-3'>
                  <div>
                    <FormLabel>Publish immediately</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type='submit' disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? (
                  <>
                    <Loader2 className='mr-2 size-4 animate-spin' />
                    Saving
                  </>
                ) : isEditing ? (
                  'Update episode'
                ) : (
                  'Create episode'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
