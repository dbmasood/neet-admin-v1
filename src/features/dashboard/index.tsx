import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { format, parseISO } from 'date-fns'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ExamSelector } from '@/components/exam-selector'
import { examLabelMap, type ExamSelection, useCurrentExam } from '@/stores/exam-store'
import {
  useAnalyticsOverviewQuery,
  useAnalyticsTimeSeriesQuery,
  useReferralSummaryQuery,
  useSubjectAccuracyQuery,
  useUpcomingEventsQuery,
  useWeakTopicsQuery,
} from './api'
import {
  examConfigTypeLabels,
  examStatusLabels,
  type AdminReferralSummary,
  type AnalyticsTimeSeries,
} from '@/types/admin'

type ActivityPoint = {
  date: string
  value: number
}

type WeakTopicRow = {
  subject: string
  topic: string
  accuracy: number
  attempts: number
}

const dateRangeOptions = ['Today', 'Last 7 days', 'Last 30 days'] as const

type DateRange = (typeof dateRangeOptions)[number]



function ActivityChart({
  data,
  color,
  isLoading,
}: {
  data: ActivityPoint[]
  color?: string
  isLoading?: boolean
}) {
  if (isLoading) {
    return <p className='text-sm text-muted-foreground'>Loading chart...</p>
  }
  if (!data.length) {
    return (
      <p className='text-sm text-muted-foreground'>
        No data available for the selected range.
      </p>
    )
  }
  return (
    <ResponsiveContainer width='100%' height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray='3 3' opacity={0.2} />
        <XAxis dataKey='date' tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip labelStyle={{ fontSize: 12 }} />
        <Line
          type='monotone'
          dataKey='value'
          stroke={color ?? '#0ea5e9'}
          strokeWidth={2}
          dot={{ r: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

function AccuracyChart({
  data,
  isLoading,
}: {
  data: { subject: string; accuracy: number }[]
  isLoading?: boolean
}) {
  if (isLoading) {
    return <p className='text-sm text-muted-foreground'>Loading chart...</p>
  }
  if (!data.length) {
    return (
      <p className='text-sm text-muted-foreground'>
        No subject accuracy data available.
      </p>
    )
  }
  return (
    <ResponsiveContainer width='100%' height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray='3 3' opacity={0.2} />
        <XAxis dataKey='subject' tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} domain={[30, 90]} />
        <Tooltip />
        <Bar dataKey='accuracy' fill='#22c55e' radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function formatTimeSeries(series?: AnalyticsTimeSeries): ActivityPoint[] {
  if (!series?.points?.length) return []
  return series.points.map((point) => ({
    date: formatDateLabel(point.date),
    value: point.value ?? 0,
  }))
}

function formatDateLabel(value?: string) {
  if (!value) return ''
  try {
    return format(parseISO(value), 'dd MMM')
  } catch {
    return value
  }
}

function toPercent(value?: number) {
  if (value == null) return 0
  const normalized = value <= 1 ? value * 100 : value
  return Math.round(normalized)
}

function buildReferralSnapshot(
  summary: AdminReferralSummary | undefined,
  fallbackRange: string
) {
  return [
    {
      title: 'Total Referrals',
      value:
        summary?.totalReferrals != null
          ? summary.totalReferrals.toLocaleString()
          : '—',
      caption: summary?.range
        ? `Range: ${summary.range}`
        : `Range: ${fallbackRange}`,
    },
    {
      title: 'Referral Rewards Paid (₹)',
      value:
        summary?.rewardsPaid != null
          ? `₹${summary.rewardsPaid.toLocaleString()}`
          : '—',
      caption:
        summary?.newUsers != null
          ? `${summary.newUsers.toLocaleString()} new users`
          : 'Cash + token payouts',
    },
  ]
}

function formatEventDate(value: string) {
  if (!value) return '—'
  try {
    return format(parseISO(value), 'dd MMM yyyy · HH:mm')
  } catch {
    return value
  }
}

export function Dashboard() {
  const { exam } = useCurrentExam()
  const [range, setRange] = useState<DateRange>('Last 7 days')
  const examLabel = examLabelMap[exam]
  const rangeParam =
    range === 'Today' ? 'today' : range === 'Last 7 days' ? '7d' : '30d'
  const filteredExam = exam === 'ALL' ? undefined : exam

  const { data: overview, isLoading: isAnalyticsLoading } =
    useAnalyticsOverviewQuery({
      exam: filteredExam,
      range: rangeParam,
    })

  const {
    data: activeSeries,
    isLoading: isActiveSeriesLoading,
  } = useAnalyticsTimeSeriesQuery({
    exam: filteredExam,
    range: rangeParam,
    metric: 'active_users',
  })

  const {
    data: questionsSeries,
    isLoading: isQuestionsSeriesLoading,
  } = useAnalyticsTimeSeriesQuery({
    exam: filteredExam,
    range: rangeParam,
    metric: 'questions_answered',
  })

  const {
    data: accuracyResponse,
    isLoading: isAccuracyLoading,
  } = useSubjectAccuracyQuery({
    exam: filteredExam,
  })

  const {
    data: weakTopicsResponse,
    isLoading: isWeakTopicsLoading,
  } = useWeakTopicsQuery({
    exam: filteredExam,
    limit: 10,
  })

  const {
    data: eventsResponse,
    isLoading: isEventsLoading,
  } = useUpcomingEventsQuery({
    exam: filteredExam,
  })

  const {
    data: referralSummary,
    isLoading: isReferralLoading,
  } = useReferralSummaryQuery({
    range: rangeParam,
  })

  const dailyActive = useMemo(
    () => formatTimeSeries(activeSeries),
    [activeSeries]
  )

  const dailyQuestions = useMemo(
    () => formatTimeSeries(questionsSeries),
    [questionsSeries]
  )

  const accuracyData = useMemo(
    () =>
      (accuracyResponse?.subjects ?? []).map((subject) => ({
        subject: subject.subjectName,
        accuracy: toPercent(subject.accuracy),
      })),
    [accuracyResponse]
  )

  const weakestTopics = useMemo<WeakTopicRow[]>(() => {
    return (weakTopicsResponse?.items ?? []).map((topic) => ({
      subject: topic.subjectName,
      topic: topic.topicName,
      accuracy: toPercent(topic.accuracy),
      attempts: topic.attempts ?? 0,
    }))
  }, [weakTopicsResponse])

  const upcomingEvents = useMemo(
    () => eventsResponse?.items ?? [],
    [eventsResponse]
  )

  const referralSnapshot = useMemo(
    () => buildReferralSnapshot(referralSummary, range),
    [referralSummary, range]
  )

  return (
    <>
      <Header>
        <div className='flex w-full flex-col gap-2 lg:flex-row lg:items-center'>
          <div>
            <p className='text-xs uppercase tracking-wide text-muted-foreground'>
              Admin panel
            </p>
            <div className='flex flex-wrap items-center gap-3'>
              <h1 className='text-2xl font-semibold tracking-tight'>Admin Dashboard</h1>
              <p className='text-sm text-muted-foreground'>Exam: {examLabel}</p>
            </div>
          </div>
          <div className='flex flex-1 flex-wrap items-center gap-3 lg:justify-end'>
            <Select value={range} onValueChange={(value) => setRange(value as DateRange)}>
              <SelectTrigger className='h-9 min-w-[140px] rounded-full px-3 text-sm'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateRangeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ExamSelector />
            <Search />
            <ThemeSwitch />
            <ConfigDrawer />
            <ProfileDropdown />
          </div>
        </div>
      </Header>
      <Main>
        <div className='space-y-6'>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {[
              {
                title: 'Total Users',
                value:
                  overview?.totalUsers != null
                    ? overview.totalUsers.toLocaleString()
                    : '—',
                caption: 'All-time registrations',
              },
              {
                title: `Active Users (${range})`,
                value:
                  overview?.activeUsers != null
                    ? overview.activeUsers.toLocaleString()
                    : '—',
                caption: 'Logged activity in selected range',
              },
              {
                title: 'Questions Answered',
                value:
                  overview?.questionsAnswered != null
                    ? overview.questionsAnswered.toLocaleString()
                    : '—',
                caption: `${range} attempts`,
              },
              {
                title: 'Average Accuracy',
                value:
                  overview?.averageAccuracy != null
                    ? `${overview.averageAccuracy.toFixed(1)}%`
                    : '—',
                caption: `${range} average`,
              },
              {
                title: 'Avg Study Minutes',
                value:
                  overview?.averageStudyMinutes != null
                    ? overview.averageStudyMinutes.toFixed(1)
                    : '—',
                caption: 'Per active learner',
              },
              {
                title: 'Total Rewards',
                value:
                  overview?.totalRewards != null
                    ? overview.totalRewards.toLocaleString()
                    : '—',
                caption: 'Lifetime tokens/coins',
              },
            ].map((stat) => (
              <Card key={stat.title}>
                <CardHeader>
                  <CardTitle className='text-sm font-semibold'>{stat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-2xl font-bold'>
                    {isAnalyticsLoading ? '...' : stat.value}
                  </p>
                  <p className='text-xs text-muted-foreground'>{stat.caption}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className='grid gap-4 lg:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Daily Active Users</CardTitle>
                <CardDescription>Past 30 days trend</CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityChart
                  data={dailyActive}
                  isLoading={isActiveSeriesLoading}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Questions Answered Per Day</CardTitle>
                <CardDescription>Across {examLabel}</CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityChart
                  data={dailyQuestions}
                  color='#f97316'
                  isLoading={isQuestionsSeriesLoading}
                />
              </CardContent>
            </Card>
          </div>

          <div className='grid gap-4 lg:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Accuracy by Subject</CardTitle>
                <CardDescription>Average accuracy for {examLabel}</CardDescription>
              </CardHeader>
              <CardContent className='pb-2'>
                <AccuracyChart
                  data={accuracyData}
                  isLoading={isAccuracyLoading}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Weakest Topics (Global)</CardTitle>
                <CardDescription>
                  Lowest accuracy topics for the selected exam
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-2'>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell className='font-semibold'>Subject</TableCell>
                      <TableCell className='font-semibold'>Topic</TableCell>
                      <TableCell className='font-semibold'>Avg Accuracy</TableCell>
                      <TableCell className='font-semibold'>Attempts</TableCell>
                    </TableRow>
                  </TableHead>
                <TableBody>
                  {isWeakTopicsLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className='text-center'>
                        Loading weak topics...
                      </TableCell>
                    </TableRow>
                  ) : !weakestTopics.length ? (
                    <TableRow>
                      <TableCell colSpan={4} className='text-center'>
                        No weak topics available for this exam.
                      </TableCell>
                    </TableRow>
                  ) : (
                    weakestTopics.map((topic) => (
                      <TableRow key={`${topic.subject}-${topic.topic}`}>
                        <TableCell>
                          <span className='text-sm font-medium'>{topic.subject}</span>
                        </TableCell>
                        <TableCell>
                          <span className='text-sm text-muted-foreground'>
                            {topic.topic}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant='secondary'>{topic.accuracy}%</Badge>
                        </TableCell>
                        <TableCell>
                          <span className='text-sm text-muted-foreground'>
                            {topic.attempts.toLocaleString()}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Exams & Events</CardTitle>
              <CardDescription>Click to view more details</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className='font-semibold'>Name</TableCell>
                    <TableCell className='font-semibold'>Exam</TableCell>
                    <TableCell className='font-semibold'>Type</TableCell>
                    <TableCell className='font-semibold'>Start Date</TableCell>
                    <TableCell className='font-semibold'>Registered</TableCell>
                    <TableCell className='font-semibold'>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isEventsLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className='text-center'>
                        Loading events...
                      </TableCell>
                    </TableRow>
                  ) : !upcomingEvents.length ? (
                    <TableRow>
                      <TableCell colSpan={6} className='text-center'>
                        No upcoming events.
                      </TableCell>
                    </TableRow>
                  ) : (
                    upcomingEvents.map((event) => {
                      const eventType =
                        examConfigTypeLabels[event.type] ?? event.type
                      const statusLabel =
                        examStatusLabels[event.status] ?? event.status
                      const statusVariant =
                        event.status === 'ONGOING'
                          ? 'default'
                          : event.status === 'SCHEDULED'
                          ? 'outline'
                          : 'secondary'

                      return (
                        <TableRow key={event.id}>
                          <TableCell>
                            <Link
                              to='/exams'
                              className='text-sm font-medium text-primary underline-offset-4 hover:underline'
                            >
                              {event.name}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <span className='text-sm text-muted-foreground'>
                              {examLabelMap[event.exam as ExamSelection]}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className='text-sm'>{eventType}</span>
                          </TableCell>
                          <TableCell>
                            <span className='text-sm text-muted-foreground'>
                              {formatEventDate(event.startAt)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className='text-sm text-muted-foreground'>
                              {event.registeredCount.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusVariant}>{statusLabel}</Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className='grid gap-4 md:grid-cols-2'>
            {referralSnapshot.map((stat) => (
              <Card key={stat.title}>
                <CardHeader>
                  <CardTitle className='text-sm font-semibold'>{stat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-2xl font-bold'>
                    {isReferralLoading ? '...' : stat.value}
                  </p>
                  <p className='text-xs text-muted-foreground'>{stat.caption}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Main>
    </>
  )
}
