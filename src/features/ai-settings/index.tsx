import { useEffect, useMemo } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Switch } from '@/components/ui/switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useAISettingsQuery, useUpdateAISettingsMutation } from './api'

const aiSettingsSchema = z.object({
  includeGuessedCorrect: z.boolean(),
  revisionEnabled: z.boolean(),
  revisionIntervalsDays: z.string().optional(),
  strongThresholdPercent: z.string().optional(),
  weaknessMinAttempts: z.string().optional(),
  weaknessThresholdPercent: z.string().optional(),
})

type AISettingsFormValues = z.infer<typeof aiSettingsSchema>

const defaultValues: AISettingsFormValues = {
  includeGuessedCorrect: false,
  revisionEnabled: false,
  revisionIntervalsDays: '',
  strongThresholdPercent: '',
  weaknessMinAttempts: '',
  weaknessThresholdPercent: '',
}

export function AISettingsPage() {
  const { data, isLoading } = useAISettingsQuery()
  const { mutateAsync, isPending } = useUpdateAISettingsMutation()

  const form = useForm<AISettingsFormValues>({
    resolver: zodResolver(aiSettingsSchema) as Resolver<AISettingsFormValues>,
    defaultValues,
  })

  useEffect(() => {
    if (data) {
      form.reset({
        includeGuessedCorrect: Boolean(data.includeGuessedCorrect),
        revisionEnabled: Boolean(data.revisionEnabled),
        revisionIntervalsDays: (data.revisionIntervalsDays ?? [])
          .map((day) => `${day}`)
          .join(', '),
        strongThresholdPercent: data.strongThresholdPercent
          ? `${data.strongThresholdPercent}`
          : '',
        weaknessMinAttempts: data.weaknessMinAttempts
          ? `${data.weaknessMinAttempts}`
          : '',
        weaknessThresholdPercent: data.weaknessThresholdPercent
          ? `${data.weaknessThresholdPercent}`
          : '',
      })
    }
  }, [data, form])

  const revisionIntervalsValue = form.watch('revisionIntervalsDays')
  const revisionIntervalsPreview = useMemo(() => {
    const value = revisionIntervalsValue ?? ''
    return value
      .split(',')
      .map((v) => Number(v.trim()))
      .filter((v) => !Number.isNaN(v))
  }, [revisionIntervalsValue])

  const onSubmit = async (values: AISettingsFormValues) => {
    const payload = {
      includeGuessedCorrect: values.includeGuessedCorrect,
      revisionEnabled: values.revisionEnabled,
      revisionIntervalsDays:
        values.revisionIntervalsDays && values.revisionIntervalsDays.length > 0
          ? values.revisionIntervalsDays
              .split(',')
              .map((v) => Number(v.trim()))
              .filter((v) => !Number.isNaN(v))
          : [],
      strongThresholdPercent: values.strongThresholdPercent
        ? Number(values.strongThresholdPercent)
        : undefined,
      weaknessMinAttempts: values.weaknessMinAttempts
        ? Number(values.weaknessMinAttempts)
        : undefined,
      weaknessThresholdPercent: values.weaknessThresholdPercent
        ? Number(values.weaknessThresholdPercent)
        : undefined,
    }

    await mutateAsync(payload)
    toast.success('AI settings updated successfully')
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>
      <Main className='flex flex-1 flex-col gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            AI & Personalization Settings
          </h2>
          <p className='text-muted-foreground'>
            Configure how the adaptive practice system evaluates learners.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Adaptive Learning Rules</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='flex items-center gap-2 text-muted-foreground'>
                <Loader2 className='size-4 animate-spin' />
                Loading AI settings...
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='space-y-6'
                >
                  <div className='grid gap-4 md:grid-cols-2'>
                    <FormField
                      control={form.control}
                      name='includeGuessedCorrect'
                      render={({ field }) => (
                        <FormItem className='flex flex-col space-y-1'>
                          <FormLabel>Include guessed correct answers</FormLabel>
                          <FormDescription>
                            Count guessed answers that happen to be correct in
                            streak & accuracy calculations.
                          </FormDescription>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='revisionEnabled'
                      render={({ field }) => (
                        <FormItem className='flex flex-col space-y-1'>
                          <FormLabel>Enable spaced revision</FormLabel>
                          <FormDescription>
                            Turns on the revision queue for overdue questions.
                          </FormDescription>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name='revisionIntervalsDays'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Revision intervals (days, comma separated)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='e.g. 1, 3, 7, 14'
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Currently configured:{' '}
                          {revisionIntervalsPreview.length
                            ? revisionIntervalsPreview.join(', ')
                            : 'None'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className='grid gap-4 md:grid-cols-3'>
                    <FormField
                      control={form.control}
                      name='strongThresholdPercent'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Strong threshold (%)</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              min={0}
                              max={100}
                              placeholder='80'
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Accuracy % that marks a concept as strong.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='weaknessThresholdPercent'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weakness threshold (%)</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              min={0}
                              max={100}
                              placeholder='50'
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Accuracy % below which topics enter revision.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='weaknessMinAttempts'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min attempts for weakness</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              min={0}
                              placeholder='20'
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Minimum attempts before labeling weak topic.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type='submit' disabled={isPending}>
                    {isPending ? (
                      <>
                        <Loader2 className='mr-2 size-4 animate-spin' />
                        Saving
                      </>
                    ) : (
                      'Save settings'
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
