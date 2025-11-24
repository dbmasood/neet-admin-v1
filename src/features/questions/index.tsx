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
import { Switch } from '@/components/ui/switch'
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
import { useSubjectsQuery } from '@/features/subjects/api'
import { useTopicsQuery } from '@/features/topics/api'
import {
  useCreateQuestionMutation,
  useDeleteQuestionMutation,
  useQuestionsQuery,
  useUpdateQuestionMutation,
} from './api'
import {
  examCategoryLabels,
  type Question,
  type QuestionCreateRequest,
  type Subject,
  type Topic,
} from '@/types/admin'

const choiceTypeOptions = [
  { label: 'Single correct', value: 'single' },
  { label: 'Multiple correct', value: 'multi' },
]

const questionSchema = z.object({
  questionText: z.string().min(1, 'Question text is required'),
  exam: z.string().min(1, 'Exam is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  topicId: z.string().min(1, 'Topic is required'),
  optionA: z.string().min(1, 'Option A is required'),
  optionB: z.string().min(1, 'Option B is required'),
  optionC: z.string().min(1, 'Option C is required'),
  optionD: z.string().min(1, 'Option D is required'),
  correctOption: z.coerce.number().min(1).max(4),
  choiceType: z.enum(['single', 'multi']),
  difficultyLevel: z.string().optional(),
  explanation: z.string().optional(),
  isActive: z.boolean(),
  isClinical: z.boolean(),
  isHighYield: z.boolean(),
  isImageBased: z.boolean(),
})

type QuestionFormValues = z.infer<typeof questionSchema>

type QuestionFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  subjects: Subject[]
  initialQuestion?: Question | null
  defaultExam?: string
}

export function QuestionsPage() {
  const { exam } = useCurrentExam()
  const [subjectFilter, setSubjectFilter] = useState('')
  const [topicFilter, setTopicFilter] = useState('')
  const [questionModalOpen, setQuestionModalOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null)

  const { data: subjects, isLoading: isLoadingSubjects } = useSubjectsQuery()
  const filteredSubjects = useMemo(() => {
    if (!subjects) return []
    if (exam === 'ALL') return subjects
    return subjects.filter((subject) => subject.exam === exam)
  }, [subjects, exam])

  const {
    data: topicsForFilter,
    isLoading: isLoadingTopics,
  } = useTopicsQuery(subjectFilter || undefined)

  const filters = useMemo(
    () => ({
      exam: exam === 'ALL' ? undefined : exam,
      subjectId: subjectFilter || undefined,
      topicId: topicFilter || undefined,
    }),
    [exam, subjectFilter, topicFilter]
  )

  const { data: questions, isLoading } = useQuestionsQuery(filters)
  const { mutateAsync: deleteQuestion, isPending: isDeleting } =
    useDeleteQuestionMutation()

  const subjectNameMap = useMemo(() => {
    const map = new Map<string, Subject>()
    subjects?.forEach((subject) => map.set(subject.id, subject))
    return map
  }, [subjects])

  const topicNameMap = useMemo(() => {
    const map = new Map<string, Topic>()
    topicsForFilter?.forEach((topic) => map.set(topic.id, topic))
    return map
  }, [topicsForFilter])

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteQuestion(deleteTarget.id)
    toast.success('Question deleted')
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
            <h2 className='text-2xl font-bold tracking-tight'>Question bank</h2>
            <p className='text-muted-foreground'>
              Filter, review, and maintain your master question pool.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingQuestion(null)
              setQuestionModalOpen(true)
            }}
          >
            <Plus className='me-2 size-4' />
            New question
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-wrap gap-3'>
            <div className='w-full max-w-xs'>
              <FormLabel>Subject</FormLabel>
              <SelectDropdown
                isPending={isLoadingSubjects}
                items={[
                  { label: 'All subjects', value: '' },
                  ...filteredSubjects.map((subject) => ({
                    label: `${subject.name} (${examCategoryLabels[subject.exam]})`,
                    value: subject.id,
                  })),
                ]}
                defaultValue={subjectFilter}
                onValueChange={(value) => {
                  setSubjectFilter(value)
                  setTopicFilter('')
                }}
                placeholder='Filter subjects'
                isControlled
              />
            </div>
            <div className='w-full max-w-xs'>
              <FormLabel>Topic</FormLabel>
              <SelectDropdown
                isPending={isLoadingTopics}
                items={[
                  { label: 'All topics', value: '' },
                  ...(topicsForFilter ?? []).map((topic) => ({
                    label: topic.name,
                    value: topic.id,
                  })),
                ]}
                defaultValue={topicFilter}
                onValueChange={setTopicFilter}
                placeholder='Filter topics'
                isControlled
                disabled={!subjectFilter}
              />
              {!subjectFilter && (
                <FormDescription>
                  Select a subject first to filter by topic.
                </FormDescription>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Questions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='flex items-center gap-2 text-muted-foreground'>
                <Loader2 className='size-4 animate-spin' />
                Loading questions...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Exam</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!questions?.length ? (
                    <TableRow>
                      <TableCell colSpan={7} className='text-center'>
                        No questions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    questions.map((question) => {
                      const subject = subjectNameMap.get(question.subjectId)
                      const topic = topicNameMap.get(question.topicId)
                      return (
                        <TableRow key={question.id}>
                          <TableCell className='max-w-sm'>
                            <p className='line-clamp-2 font-medium'>
                              {question.questionText}
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              ID: {question.id}
                            </p>
                          </TableCell>
                          <TableCell>
                            {examCategoryLabels[question.exam]}
                          </TableCell>
                          <TableCell>{subject?.name ?? question.subjectId}</TableCell>
                          <TableCell>{topic?.name ?? question.topicId}</TableCell>
                          <TableCell>
                            {question.difficultyLevel ?? '—'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={question.isActive ? 'default' : 'outline'}
                            >
                              {question.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className='text-right space-x-2'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                setEditingQuestion(question)
                                setQuestionModalOpen(true)
                              }}
                            >
                              <Pencil className='me-1 size-4' />
                              Edit
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='text-destructive'
                              onClick={() => setDeleteTarget(question)}
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

      <QuestionForm
        open={questionModalOpen}
        onOpenChange={(open) => {
          setQuestionModalOpen(open)
          if (!open) setEditingQuestion(null)
        }}
        subjects={subjects ?? []}
        initialQuestion={editingQuestion}
        defaultExam={exam === 'ALL' ? undefined : exam}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title='Delete question'
        desc='This action will permanently remove the selected question.'
        destructive
        isLoading={isDeleting}
        handleConfirm={handleDelete}
        confirmText='Delete'
      />
    </>
  )
}

function QuestionForm({
  open,
  onOpenChange,
  subjects,
  initialQuestion,
  defaultExam,
}: QuestionFormProps) {
  const isEditing = Boolean(initialQuestion)
  const { mutateAsync: createQuestion, isPending: isCreating } =
    useCreateQuestionMutation()
  const { mutateAsync: updateQuestion, isPending: isUpdating } =
    useUpdateQuestionMutation()

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema) as Resolver<QuestionFormValues>,
    defaultValues: {
      questionText: '',
      exam: defaultExam ?? '',
      subjectId: '',
      topicId: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 1,
      choiceType: 'single',
      difficultyLevel: '',
      explanation: '',
      isActive: true,
      isClinical: false,
      isHighYield: false,
      isImageBased: false,
    },
  })

  useEffect(() => {
    if (initialQuestion) {
      form.reset({
        questionText: initialQuestion.questionText,
        exam: initialQuestion.exam,
        subjectId: initialQuestion.subjectId,
        topicId: initialQuestion.topicId,
        optionA: initialQuestion.optionA,
        optionB: initialQuestion.optionB,
        optionC: initialQuestion.optionC,
        optionD: initialQuestion.optionD,
        correctOption: initialQuestion.correctOption,
        choiceType: initialQuestion.choiceType ?? 'single',
        difficultyLevel: initialQuestion.difficultyLevel
          ? `${initialQuestion.difficultyLevel}`
          : '',
        explanation: initialQuestion.explanation ?? '',
        isActive: Boolean(initialQuestion.isActive),
        isClinical: Boolean(initialQuestion.isClinical),
        isHighYield: Boolean(initialQuestion.isHighYield),
        isImageBased: Boolean(initialQuestion.isImageBased),
      })
    } else {
      form.reset((prev) => ({
        ...prev,
        questionText: '',
        exam: defaultExam ?? '',
        subjectId: '',
        topicId: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctOption: 1,
        choiceType: 'single',
        difficultyLevel: '',
        explanation: '',
        isActive: true,
        isClinical: false,
        isHighYield: false,
        isImageBased: false,
      }))
    }
  }, [initialQuestion, defaultExam, form])

  const subjectId = form.watch('subjectId')
  const { data: topics, isLoading: isTopicsLoading } = useTopicsQuery(
    subjectId || undefined
  )

  const onSubmit = async (values: QuestionFormValues) => {
    const payload: QuestionCreateRequest = {
      questionText: values.questionText,
      exam: values.exam as QuestionCreateRequest['exam'],
      subjectId: values.subjectId,
      topicId: values.topicId,
      optionA: values.optionA,
      optionB: values.optionB,
      optionC: values.optionC,
      optionD: values.optionD,
      correctOption: values.correctOption,
      choiceType: values.choiceType,
      explanation: values.explanation ?? undefined,
      difficultyLevel: values.difficultyLevel
        ? Number(values.difficultyLevel)
        : undefined,
      isActive: values.isActive,
      isClinical: values.isClinical,
      isHighYield: values.isHighYield,
      isImageBased: values.isImageBased,
    }

    if (isEditing && initialQuestion) {
      await updateQuestion({ id: initialQuestion.id, payload })
      toast.success('Question updated')
    } else {
      await createQuestion(payload)
      toast.success('Question created')
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto max-w-4xl'>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit question' : 'Create question'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
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
            <FormField
              control={form.control}
              name='subjectId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <SelectDropdown
                      items={subjects.map((subject) => ({
                        label: `${subject.name} (${examCategoryLabels[subject.exam]})`,
                        value: subject.id,
                      }))}
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
                      items={(topics ?? []).map((topic) => ({
                        label: topic.name,
                        value: topic.id,
                      }))}
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select topic'
                      isControlled
                      disabled={!subjectId}
                    />
                  </FormControl>
                  <FormDescription>
                    {subjectId
                      ? 'Showing topics for the selected subject.'
                      : 'Select a subject to load available topics.'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='questionText'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder='Enter question stem'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid gap-4 md:grid-cols-2'>
              {(['optionA', 'optionB', 'optionC', 'optionD'] as const).map(
                (option) => (
                  <FormField
                    key={option}
                    control={form.control}
                    name={option}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {option.replace('option', 'Option ')}
                        </FormLabel>
                        <FormControl>
                          <Input placeholder='Enter answer choice' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )
              )}
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='correctOption'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correct option (1-4)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={1}
                        max={4}
                        {...field}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='choiceType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Choice type</FormLabel>
                    <FormControl>
                      <SelectDropdown
                        items={choiceTypeOptions}
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
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='difficultyLevel'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty level</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='1-10'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional numeric difficulty indicator.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='explanation'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Explanation</FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder='Rationale' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              {[
                { name: 'isActive', label: 'Active' },
                { name: 'isClinical', label: 'Clinical vignette' },
                { name: 'isHighYield', label: 'High yield' },
                { name: 'isImageBased', label: 'Image based' },
              ].map(({ name, label }) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name as keyof QuestionFormValues}
                  render={({ field }) => (
                    <FormItem className='flex items-center justify-between rounded-md border p-3'>
                      <div>
                        <FormLabel>{label}</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value as boolean}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <DialogFooter>
              <Button type='submit' disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? (
                  <>
                    <Loader2 className='mr-2 size-4 animate-spin' />
                    Saving
                  </>
                ) : isEditing ? (
                  'Update question'
                ) : (
                  'Create question'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
