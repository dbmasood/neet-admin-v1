import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { format, subDays } from 'date-fns'
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

type ActivityPoint = {
  date: string
  value: number
}

type WeakTopicRow = {
  subject: string
  topic: string
  accuracy: number
  attempts: number
  exam: ExamSelection
}

type EventRow = {
  id: string
  name: string
  exam: ExamSelection
  type: string
  startDate: string
  registered: string
  status: 'Scheduled' | 'Ongoing' | 'Completed'
}

const dateRangeOptions = ['Today', 'Last 7 days', 'Last 30 days'] as const

type DateRange = (typeof dateRangeOptions)[number]

const kpiCards = [
  {
    title: 'Total Users',
    value: '12,340',
    caption: '+5% vs last 7 days',
  },
  {
    title: 'Active Users (DAU)',
    value: '1,230',
    caption: '58% of total users',
  },
  {
    title: 'Questions Answered',
    value: '18,540',
    caption: 'Avg per user: 15',
  },
  {
    title: 'Average Accuracy',
    value: '62%',
    caption: 'Last 7 days',
  },
  {
    title: 'Avg Study Time',
    value: '42 min',
    caption: 'Per active user',
  },
  {
    title: 'Total Rewards (₹)',
    value: '₹32,400',
    caption: 'Tokens, exams, referrals',
  },
]

const subjectAccuracyMap: Record<ExamSelection, { subject: string; accuracy: number }[]> = {
  NEET_PG: [
    { subject: 'Anatomy', accuracy: 72 },
    { subject: 'Physiology', accuracy: 65 },
    { subject: 'Biochemistry', accuracy: 58 },
    { subject: 'Pathology', accuracy: 62 },
    { subject: 'Pharmacology', accuracy: 55 },
    { subject: 'Microbiology', accuracy: 60 },
  ],
  NEET_UG: [
    { subject: 'Physics', accuracy: 68 },
    { subject: 'Chemistry', accuracy: 70 },
    { subject: 'Biology', accuracy: 63 },
    { subject: 'Mathematics', accuracy: 61 },
    { subject: 'Botany', accuracy: 66 },
    { subject: 'Zoology', accuracy: 64 },
  ],
  JEE: [
    { subject: 'Mechanics', accuracy: 71 },
    { subject: 'Electrostatics', accuracy: 64 },
    { subject: 'Organic Chemistry', accuracy: 59 },
    { subject: 'Inorganic Chemistry', accuracy: 62 },
    { subject: 'Thermodynamics', accuracy: 55 },
    { subject: 'Coordination Chemistry', accuracy: 58 },
  ],
  UPSC: [
    { subject: 'Polity', accuracy: 74 },
    { subject: 'History', accuracy: 61 },
    { subject: 'Geography', accuracy: 66 },
    { subject: 'Economy', accuracy: 59 },
    { subject: 'Environment', accuracy: 68 },
    { subject: 'Current Affairs', accuracy: 63 },
  ],
  ALL: [
    { subject: 'Anatomy', accuracy: 70 },
    { subject: 'Physics', accuracy: 66 },
    { subject: 'Polity', accuracy: 68 },
    { subject: 'Chemistry', accuracy: 64 },
    { subject: 'History', accuracy: 62 },
    { subject: 'Biochemistry', accuracy: 60 },
  ],
}

const weakestTopicsData: WeakTopicRow[] = [
  { subject: 'Pharmacology', topic: 'Autonomic Drugs', accuracy: 42, attempts: 1240, exam: 'NEET_PG' },
  { subject: 'Anatomy', topic: 'Neuroanatomy', accuracy: 45, attempts: 1120, exam: 'NEET_PG' },
  { subject: 'Physics', topic: 'Electrostatics', accuracy: 48, attempts: 980, exam: 'JEE' },
  { subject: 'Chemistry', topic: 'Coordination Chemistry', accuracy: 49, attempts: 1050, exam: 'JEE' },
  { subject: 'Polity', topic: 'Constitution', accuracy: 51, attempts: 980, exam: 'UPSC' },
  { subject: 'History', topic: 'Medieval India', accuracy: 54, attempts: 910, exam: 'UPSC' },
  { subject: 'Physics', topic: 'Modern Physics', accuracy: 53, attempts: 870, exam: 'JEE' },
  { subject: 'Biology', topic: 'Genetics', accuracy: 47, attempts: 930, exam: 'NEET_UG' },
  { subject: 'Chemistry', topic: 'Organic Mechanisms', accuracy: 50, attempts: 890, exam: 'NEET_UG' },
  { subject: 'Geography', topic: 'Map Reading', accuracy: 55, attempts: 840, exam: 'UPSC' },
]

const eventData: EventRow[] = [
  {
    id: 'mock-bio-1',
    name: 'NEET PG - High Yield Bio Mock',
    exam: 'NEET_PG',
    type: 'Mock',
    startDate: '12 Nov 2024 · 10:00 IST',
    registered: '2,420',
    status: 'Scheduled',
  },
  {
    id: 'subject-test-1',
    name: 'NEET UG · Anatomy Sprint',
    exam: 'NEET_UG',
    type: 'Subject Test',
    startDate: '14 Nov 2024 · 18:30 IST',
    registered: '1,180',
    status: 'Scheduled',
  },
  {
    id: 'reward-event-1',
    name: 'JEE · Daily Accuracy Push',
    exam: 'JEE',
    type: 'Reward Event',
    startDate: 'Daily · 08:00 IST',
    registered: '3,900',
    status: 'Ongoing',
  },
  {
    id: 'upsc-daily-1',
    name: 'UPSC · GS Current Affairs',
    exam: 'UPSC',
    type: 'Subject Test',
    startDate: '15 Nov 2024 · 07:00 IST',
    registered: '870',
    status: 'Scheduled',
  },
]

const referralSnapshot = [
  {
    title: 'Total Referrals',
    value: '980',
    caption: 'New users acquired through referrals this month',
  },
  {
    title: 'Referral Rewards Paid (₹)',
    value: '₹18,200',
    caption: 'Cash + token payouts',
  },
]

const examSeedOffset: Record<ExamSelection, number> = {
  NEET_PG: 10,
  NEET_UG: 8,
  JEE: 12,
  UPSC: 6,
  ALL: 5,
}

const formatDay = (date: Date) => format(date, 'dd MMM')

function buildDailySeries(
  exam: ExamSelection,
  base: number,
  variance: number,
  slope: number,
  dates: Date[]
): ActivityPoint[] {
  const seed = examSeedOffset[exam] ?? 6
  return dates.map((date, index) => {
    const noise = Math.sin((index + seed) / 3)
    const value = Math.max(
      0,
      Math.round(base + seed * 4 + noise * variance + index * slope)
    )
    return {
      date: formatDay(date),
      value,
    }
  })
}

function ActivityChart({ data, color }: { data: ActivityPoint[]; color?: string }) {
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

function AccuracyChart({ data }: { data: { subject: string; accuracy: number }[] }) {
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

export function Dashboard() {
  const { exam } = useCurrentExam()
  const [range, setRange] = useState<DateRange>('Last 7 days')
  const examLabel = examLabelMap[exam]
  const last30Days = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 30 }, (_, index) => subDays(today, 29 - index))
  }, [])

  const dailyActive = useMemo(
    () => buildDailySeries(exam, 900, 140, 4, last30Days),
    [exam, last30Days]
  )

  const dailyQuestions = useMemo(
    () => buildDailySeries(exam, 15500, 220, 12, last30Days),
    [exam, last30Days]
  )

  const accuracyData = subjectAccuracyMap[exam] ?? subjectAccuracyMap.ALL

  const weakestTopics = useMemo(() => {
    return weakestTopicsData
      .filter((topic) => exam === 'ALL' || topic.exam === exam)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 10)
  }, [exam])

  const upcomingEvents = useMemo(() => {
    return eventData.filter((event) => exam === 'ALL' || event.exam === exam)
  }, [exam])

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
            {kpiCards.map((stat) => (
              <Card key={stat.title}>
                <CardHeader>
                  <CardTitle className='text-sm font-semibold'>{stat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-2xl font-bold'>{stat.value}</p>
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
                <ActivityChart data={dailyActive} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Questions Answered Per Day</CardTitle>
                <CardDescription>Across {examLabel}</CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityChart data={dailyQuestions} color='#f97316' />
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
                <AccuracyChart data={accuracyData} />
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
                    {weakestTopics.map((topic) => (
                      <TableRow key={`${topic.subject}-${topic.topic}`}>
                        <TableCell>
                          <span className='text-sm font-medium'>{topic.subject}</span>
                        </TableCell>
                        <TableCell>
                          <span className='text-sm text-muted-foreground'>{topic.topic}</span>
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
                    ))}
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
                  {upcomingEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <Link
                          to={`/exams/${event.id}`}
                          className='text-sm font-medium text-primary underline-offset-4 hover:underline'
                        >
                          {event.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className='text-sm text-muted-foreground'>
                          {examLabelMap[event.exam]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className='text-sm'>{event.type}</span>
                      </TableCell>
                      <TableCell>
                        <span className='text-sm text-muted-foreground'>
                          {event.startDate}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className='text-sm text-muted-foreground'>
                          {event.registered}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            event.status === 'Ongoing'
                              ? 'default'
                              : event.status === 'Scheduled'
                              ? 'outline'
                              : 'secondary'
                          }
                        >
                          {event.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
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
                  <p className='text-2xl font-bold'>{stat.value}</p>
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
