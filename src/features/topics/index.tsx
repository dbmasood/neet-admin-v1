import { useEffect, useMemo, useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus } from 'lucide-react'
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
  DialogTrigger,
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
import { ConfigDrawer } from '@/components/config-drawer'
import { ExamSelector } from '@/components/exam-selector'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useCurrentExam } from '@/stores/exam-store'
import { useCreateTopicMutation, useTopicsQuery } from './api'
import { useSubjectsQuery } from '@/features/subjects/api'
import { examCategoryLabels, type AdminTopicCreateRequest } from '@/types/admin'

const topicSchema = z.object({
  name: z.string().min(1, 'Topic name is required'),
  subjectId: z.string().min(1, 'Subject is required'),
})

type TopicFormValues = z.infer<typeof topicSchema>

export function TopicsPage() {
  const [open, setOpen] = useState(false)
  const [subjectFilter, setSubjectFilter] = useState<string>('')
  const { exam } = useCurrentExam()
  const { data: subjects, isLoading: isLoadingSubjects } = useSubjectsQuery()
  const filteredSubjects = useMemo(() => {
    if (!subjects) return []
    if (exam === 'ALL') return subjects
    return subjects.filter((subject) => subject.exam === exam)
  }, [subjects, exam])

  useEffect(() => {
    if (!subjectFilter && filteredSubjects.length > 0) {
      setSubjectFilter(filteredSubjects[0].id)
    }
  }, [filteredSubjects, subjectFilter])

  const {
    data: topics,
    isLoading,
  } = useTopicsQuery(subjectFilter || undefined)

  const { mutateAsync, isPending } = useCreateTopicMutation()

  const form = useForm<TopicFormValues>({
    resolver: zodResolver(topicSchema) as Resolver<TopicFormValues>,
    defaultValues: { name: '', subjectId: '' },
  })

  useEffect(() => {
    form.setValue('subjectId', subjectFilter)
  }, [subjectFilter, form])

  const onSubmit = async (values: TopicFormValues) => {
    await mutateAsync(values as AdminTopicCreateRequest)
    toast.success('Topic created')
    form.reset({ name: '', subjectId: subjectFilter })
    setOpen(false)
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
            <h2 className='text-2xl font-bold tracking-tight'>Topics</h2>
            <p className='text-muted-foreground'>
              Drill down into subjects and manage fine-grained topic tags.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button disabled={!subjectFilter}>
                <Plus className='me-2 size-4' />
                New topic
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create topic</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='space-y-4'
                >
                  <FormField
                    control={form.control}
                    name='subjectId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <SelectDropdown
                            isPending={isLoadingSubjects}
                            items={filteredSubjects.map((subject) => ({
                              label: `${subject.name} (${examCategoryLabels[subject.exam]})`,
                              value: subject.id,
                            }))}
                            defaultValue={field.value}
                            onValueChange={(value) => {
                              field.onChange(value)
                              setSubjectFilter(value)
                            }}
                            placeholder='Pick a subject'
                            isControlled
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder='Autonomic nervous system' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type='submit' disabled={isPending}>
                      {isPending ? (
                        <>
                          <Loader2 className='mr-2 size-4 animate-spin' />
                          Saving
                        </>
                      ) : (
                        'Create topic'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Topics</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex flex-wrap items-center gap-2'>
              <p className='text-sm text-muted-foreground'>Filter by subject</p>
              <SelectDropdown
                isPending={isLoadingSubjects}
                items={filteredSubjects.map((subject) => ({
                  label: `${subject.name} (${examCategoryLabels[subject.exam]})`,
                  value: subject.id,
                }))}
                defaultValue={subjectFilter}
                onValueChange={setSubjectFilter}
                placeholder='Select subject'
                isControlled
              />
            </div>
            {isLoading ? (
              <div className='flex items-center gap-2 text-muted-foreground'>
                <Loader2 className='size-4 animate-spin' />
                Loading topics...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Topic</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!topics?.length ? (
                    <TableRow>
                      <TableCell colSpan={3} className='text-center'>
                        {subjectFilter
                          ? 'No topics for this subject yet'
                          : 'Select a subject to see topics'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    topics.map((topic) => {
                      const subject = subjects?.find(
                        (item) => item.id === topic.subjectId
                      )
                      return (
                        <TableRow key={topic.id}>
                          <TableCell>
                            <div>
                              <p className='font-medium'>{topic.name}</p>
                              <p className='text-xs text-muted-foreground'>
                                ID: {topic.id}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {subject
                              ? `${subject.name} (${examCategoryLabels[subject.exam]})`
                              : topic.subjectId}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={topic.isActive ? 'default' : 'outline'}
                            >
                              {topic.isActive ? 'Active' : 'Inactive'}
                            </Badge>
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
    </>
  )
}
