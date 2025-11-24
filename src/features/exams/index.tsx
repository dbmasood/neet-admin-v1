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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SelectDropdown } from '@/components/select-dropdown'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
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
import {
  examConfigTypeLabels,
  examStatusLabels,
  type ExamConfig,
  type ExamConfigCreateRequest,
  type ExamConfigUpdateRequest,
} from '@/types/admin'
import {
  useCreateExamConfigMutation,
  useDeleteExamConfigMutation,
  useExamConfigsQuery,
  useUpdateExamConfigMutation,
} from './api'

const examTypeOptions = Object.entries(examConfigTypeLabels).map(
  ([value, label]) => ({
    value,
    label,
  })
)

const examStatusOptions = Object.entries(examStatusLabels).map(
  ([value, label]) => ({
    value,
    label,
  })
)

const examSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  exam: z.string().min(1, 'Exam is required'),
  type: z.string().min(1, 'Type is required'),
  description: z.string().optional(),
  numQuestions: z.coerce.number().positive(),
  timeLimitMinutes: z.coerce.number().positive(),
  entryFee: z.string().optional(),
  marksPerCorrect: z.string().optional(),
  negativePerWrong: z.string().optional(),
  scheduleStartAt: z.string().optional(),
  scheduleEndAt: z.string().optional(),
  status: z.string().optional(),
})

type ExamFormValues = z.infer<typeof examSchema>

type ExamFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultExam?: string
  initialExam?: ExamConfig | null
}

const toDateTimeLocal = (date?: string) => {
  if (!date) return ''
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return ''
  const offset = parsed.getTimezoneOffset()
  const local = new Date(parsed.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

export function ExamsPage() {
  const { exam } = useCurrentExam()
  const [formOpen, setFormOpen] = useState(false)
  const [editingExam, setEditingExam] = useState<ExamConfig | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ExamConfig | null>(null)

  const filters = useMemo(
    () => ({ exam: exam === 'ALL' ? undefined : exam }),
    [exam]
  )

  const { data: exams, isLoading } = useExamConfigsQuery(filters)
  const { mutateAsync: deleteExam, isPending: isDeleting } =
    useDeleteExamConfigMutation()

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteExam(deleteTarget.id)
    toast.success('Exam deleted')
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
            <h2 className='text-2xl font-bold tracking-tight'>
              Exams & live events
            </h2>
            <p className='text-muted-foreground'>
              Create mock tests, daily events, and manage their schedules.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingExam(null)
              setFormOpen(true)
            }}
          >
            <Plus className='me-2 size-4' />
            New exam
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Exam configurations</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='flex items-center gap-2 text-muted-foreground'>
                <Loader2 className='size-4 animate-spin' />
                Loading exams...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Exam</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!exams?.length ? (
                    <TableRow>
                      <TableCell colSpan={7} className='text-center'>
                        No exams yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    exams.map((config) => (
                      <TableRow key={config.id}>
                        <TableCell>
                          <div>
                            <p className='font-medium'>{config.name}</p>
                            <p className='text-xs text-muted-foreground'>
                              {config.description ?? 'No description'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {config.exam ? config.exam.replace('_', ' ') : '—'}
                        </TableCell>
                        <TableCell>
                          {config.type
                            ? examConfigTypeLabels[config.type]
                            : '—'}
                        </TableCell>
                        <TableCell>{config.numQuestions ?? '—'}</TableCell>
                        <TableCell className='text-sm text-muted-foreground'>
                          {config.scheduleStartAt
                            ? new Date(config.scheduleStartAt).toLocaleString()
                            : '—'}
                          <br />
                          {config.scheduleEndAt
                            ? new Date(config.scheduleEndAt).toLocaleString()
                            : ''}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              config.status === 'ONGOING'
                                ? 'default'
                                : config.status === 'SCHEDULED'
                                  ? 'secondary'
                                  : 'outline'
                            }
                          >
                            {config.status
                              ? examStatusLabels[config.status]
                              : 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-right space-x-2'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              setEditingExam(config)
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
                            onClick={() => setDeleteTarget(config)}
                          >
                            <Trash2 className='me-1 size-4' />
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Main>

      <ExamForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingExam(null)
        }}
        defaultExam={exam === 'ALL' ? undefined : exam}
        initialExam={editingExam}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title='Delete exam'
        desc='This will permanently remove the selected exam configuration.'
        destructive
        isLoading={isDeleting}
        handleConfirm={handleDelete}
        confirmText='Delete'
      />
    </>
  )
}

function ExamForm({
  open,
  onOpenChange,
  defaultExam,
  initialExam,
}: ExamFormProps) {
  const isEditing = Boolean(initialExam)
  const { mutateAsync: createExam, isPending: isCreating } =
    useCreateExamConfigMutation()
  const { mutateAsync: updateExam, isPending: isUpdating } =
    useUpdateExamConfigMutation()

  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema) as Resolver<ExamFormValues>,
    defaultValues: {
      name: '',
      exam: defaultExam ?? '',
      type: 'MOCK',
      description: '',
      numQuestions: 50,
      timeLimitMinutes: 60,
      entryFee: '',
      marksPerCorrect: '',
      negativePerWrong: '',
      scheduleStartAt: '',
      scheduleEndAt: '',
      status: '',
    },
  })

  useEffect(() => {
    if (initialExam) {
      form.reset({
        name: initialExam.name,
        exam: initialExam.exam,
        type: initialExam.type ?? 'MOCK',
        description: initialExam.description ?? '',
        numQuestions: initialExam.numQuestions ?? 50,
        timeLimitMinutes: initialExam.timeLimitMinutes ?? 60,
        entryFee: initialExam.entryFee?.toString() ?? '',
        marksPerCorrect: initialExam.marksPerCorrect?.toString() ?? '',
        negativePerWrong: initialExam.negativePerWrong?.toString() ?? '',
        scheduleStartAt: toDateTimeLocal(initialExam.scheduleStartAt),
        scheduleEndAt: toDateTimeLocal(initialExam.scheduleEndAt),
        status: initialExam.status ?? 'DRAFT',
      })
    } else {
      form.reset((prev) => ({
        ...prev,
        exam: defaultExam ?? '',
        status: '',
      }))
    }
  }, [initialExam, defaultExam, form])

  const onSubmit = async (values: ExamFormValues) => {
    const payload: ExamConfigCreateRequest = {
      name: values.name,
      exam: values.exam as ExamConfigCreateRequest['exam'],
      type: values.type as ExamConfigCreateRequest['type'],
      description: values.description || undefined,
      numQuestions: Number(values.numQuestions),
      timeLimitMinutes: Number(values.timeLimitMinutes),
      entryFee: values.entryFee ? Number(values.entryFee) : undefined,
      marksPerCorrect: values.marksPerCorrect
        ? Number(values.marksPerCorrect)
        : undefined,
      negativePerWrong: values.negativePerWrong
        ? Number(values.negativePerWrong)
        : undefined,
      scheduleStartAt: values.scheduleStartAt
        ? new Date(values.scheduleStartAt).toISOString()
        : undefined,
      scheduleEndAt: values.scheduleEndAt
        ? new Date(values.scheduleEndAt).toISOString()
        : undefined,
    }

    if (isEditing && initialExam) {
      const updatePayload: ExamConfigUpdateRequest = {
        ...payload,
        status: values.status as ExamConfigUpdateRequest['status'],
      }
      await updateExam({ id: initialExam.id, payload: updatePayload })
      toast.success('Exam updated')
    } else {
      await createExam(payload)
      toast.success('Exam created')
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto max-w-3xl'>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit exam configuration' : 'Create exam'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Mega mock test' {...field} />
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
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exam type</FormLabel>
                    <FormControl>
                      <SelectDropdown
                        items={examTypeOptions}
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder='Select type'
                        isControlled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isEditing && (
                <FormField
                  control={form.control}
                  name='status'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <SelectDropdown
                          items={examStatusOptions}
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          placeholder='Select status'
                          isControlled
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder='Optional description' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='numQuestions'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of questions</FormLabel>
                    <FormControl>
                      <Input type='number' min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='timeLimitMinutes'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time limit (minutes)</FormLabel>
                    <FormControl>
                      <Input type='number' min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid gap-4 md:grid-cols-3'>
              <FormField
                control={form.control}
                name='entryFee'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entry fee</FormLabel>
                    <FormControl>
                      <Input type='number' placeholder='Optional' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='marksPerCorrect'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marks per correct</FormLabel>
                    <FormControl>
                      <Input type='number' step='0.1' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='negativePerWrong'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Negative per wrong</FormLabel>
                    <FormControl>
                      <Input type='number' step='0.1' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='scheduleStartAt'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start time</FormLabel>
                    <FormControl>
                      <Input type='datetime-local' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='scheduleEndAt'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End time</FormLabel>
                    <FormControl>
                      <Input type='datetime-local' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type='submit' disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? (
                  <>
                    <Loader2 className='mr-2 size-4 animate-spin' />
                    Saving
                  </>
                ) : isEditing ? (
                  'Update exam'
                ) : (
                  'Create exam'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
