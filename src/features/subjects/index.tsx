import { useMemo, useState } from 'react'
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
import { examCategoryOptions } from '@/constants/exams'
import { useCurrentExam } from '@/stores/exam-store'
import { useCreateSubjectMutation, useSubjectsQuery } from './api'
import { examCategoryLabels, type AdminSubjectCreateRequest } from '@/types/admin'

const subjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required'),
  exam: z.string().min(1, 'Exam is required'),
})

type SubjectFormValues = z.infer<typeof subjectSchema>

export function SubjectsPage() {
  const [open, setOpen] = useState(false)
  const { exam } = useCurrentExam()
  const { data, isLoading } = useSubjectsQuery()
  const { mutateAsync, isPending } = useCreateSubjectMutation()

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema) as Resolver<SubjectFormValues>,
    defaultValues: { exam: '', name: '' },
  })

  const subjects = useMemo(() => {
    if (!data) return []
    if (exam === 'ALL') return data
    return data.filter((subject) => subject.exam === exam)
  }, [data, exam])

  const onSubmit = async (values: SubjectFormValues) => {
    await mutateAsync(values as AdminSubjectCreateRequest)
    toast.success('Subject created')
    form.reset({ name: '', exam: '' })
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
            <h2 className='text-2xl font-bold tracking-tight'>Subjects</h2>
            <p className='text-muted-foreground'>
              Manage exam-specific subjects and keep the catalog up-to-date.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className='me-2 size-4' />
                New subject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create subject</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='space-y-4'
                >
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder='Anatomy' {...field} />
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
                            placeholder='Select exam'
                            defaultValue={field.value}
                            onValueChange={field.onChange}
                            isControlled
                          />
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
                        'Create subject'
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
            <CardTitle>
              {exam === 'ALL'
                ? 'All subjects'
                : `Subjects for ${examCategoryLabels[exam as keyof typeof examCategoryLabels]}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='flex items-center gap-2 text-muted-foreground'>
                <Loader2 className='size-4 animate-spin' />
                Loading subjects...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Exam</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className='text-center'>
                        No subjects yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    subjects.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell>
                          <div>
                            <p className='font-medium'>{subject.name}</p>
                            <p className='text-xs text-muted-foreground'>
                              ID: {subject.id}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {examCategoryLabels[subject.exam]}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={subject.isActive ? 'default' : 'outline'}
                          >
                            {subject.isActive ? 'Active' : 'Inactive'}
                          </Badge>
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
    </>
  )
}
