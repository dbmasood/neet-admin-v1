export type ExamCategory = 'NEET_PG' | 'NEET_UG' | 'JEE' | 'UPSC'

export type ExamConfigType = 'MOCK' | 'SUBJECT_TEST' | 'REWARD_EVENT' | 'DAILY_TEST'

export type ExamStatus = 'DRAFT' | 'SCHEDULED' | 'ONGOING' | 'COMPLETED'

export type QuestionChoiceType = 'single' | 'multi'

export const examCategoryLabels: Record<ExamCategory, string> = {
  NEET_PG: 'NEET PG',
  NEET_UG: 'NEET UG',
  JEE: 'JEE',
  UPSC: 'UPSC',
}

export const examConfigTypeLabels: Record<ExamConfigType, string> = {
  MOCK: 'Mock',
  SUBJECT_TEST: 'Subject Test',
  REWARD_EVENT: 'Reward Event',
  DAILY_TEST: 'Daily Test',
}

export const examStatusLabels: Record<ExamStatus, string> = {
  DRAFT: 'Draft',
  SCHEDULED: 'Scheduled',
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
}

export interface AISettings {
  includeGuessedCorrect?: boolean
  revisionEnabled?: boolean
  revisionIntervalsDays?: number[]
  strongThresholdPercent?: number
  weaknessMinAttempts?: number
  weaknessThresholdPercent?: number
}

export interface AnalyticsOverview {
  activeUsers?: number
  averageAccuracy?: number
  averageStudyMinutes?: number
  questionsAnswered?: number
  totalRewards?: number
  totalUsers?: number
}

export interface Coupon {
  id: string
  code: string
  type: string
  amount?: number
  description?: string
  expiresAt?: string
  isActive?: boolean
  maxUsesPerUser?: number
  maxUsesTotal?: number
}

export interface CouponCreateRequest {
  code: string
  type: string
  amount?: number
  description?: string
  expiresAt?: string
  isActive?: boolean
  maxUsesPerUser?: number
  maxUsesTotal?: number
}

export type CouponUpdateRequest = CouponCreateRequest

export interface ExamConfig {
  id: string
  exam: ExamCategory
  name: string
  description?: string
  type?: ExamConfigType
  status?: ExamStatus
  numQuestions?: number
  timeLimitMinutes?: number
  entryFee?: number
  marksPerCorrect?: number
  negativePerWrong?: number
  scheduleStartAt?: string
  scheduleEndAt?: string
}

export interface ExamConfigCreateRequest {
  exam: ExamCategory
  name: string
  numQuestions: number
  timeLimitMinutes: number
  type: ExamConfigType
  description?: string
  entryFee?: number
  marksPerCorrect?: number
  negativePerWrong?: number
  scheduleStartAt?: string
  scheduleEndAt?: string
}

export interface ExamConfigUpdateRequest {
  exam?: ExamCategory
  name?: string
  numQuestions?: number
  timeLimitMinutes?: number
  type?: ExamConfigType
  description?: string
  entryFee?: number
  marksPerCorrect?: number
  negativePerWrong?: number
  scheduleStartAt?: string
  scheduleEndAt?: string
  status?: ExamStatus
}

export interface PodcastEpisode {
  id: string
  title: string
  audioUrl: string
  exam?: ExamCategory
  subjectId?: string
  topicId?: string
  description?: string
  isActive?: boolean
  durationSeconds?: number
  tags?: string[]
}

export interface PodcastCreateRequest {
  title: string
  audioUrl: string
  exam: ExamCategory
  subjectId?: string
  topicId?: string
  description?: string
  isActive?: boolean
  durationSeconds?: number
  tags?: string[]
}

export interface Question {
  id: string
  questionText: string
  exam: ExamCategory
  subjectId: string
  topicId: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctOption: number
  choiceType?: QuestionChoiceType
  difficultyLevel?: number
  explanation?: string
  isActive?: boolean
  isClinical?: boolean
  isHighYield?: boolean
  isImageBased?: boolean
}

export interface QuestionCreateRequest {
  questionText: string
  exam: ExamCategory
  subjectId: string
  topicId: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctOption: number
  choiceType?: QuestionChoiceType
  difficultyLevel?: number
  explanation?: string
  isActive?: boolean
  isClinical?: boolean
  isHighYield?: boolean
  isImageBased?: boolean
}

export interface QuestionUpdateRequest extends Partial<QuestionCreateRequest> {}

export interface Subject {
  id: string
  exam: ExamCategory
  name: string
  isActive?: boolean
}

export interface Topic {
  id: string
  subjectId: string
  name: string
  isActive?: boolean
}

export interface AdminSubjectCreateRequest {
  exam: ExamCategory
  name: string
}

export interface AdminTopicCreateRequest {
  subjectId: string
  name: string
}

export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN'

export interface User {
  id: string
  email?: string
  displayName?: string
  telegramId?: string
  createdAt?: string
  primaryExam?: ExamCategory
  role?: UserRole
}

export interface AuthResponse {
  accessToken: string
  user: User
}

export interface AdminLoginRequest {
  username: string
  password: string
}

export interface AdminProfile {
  id: string
  displayName?: string
  email?: string
  role?: string
  primaryExam?: ExamCategory
  permissions?: string[]
  createdAt?: string
}

export interface AnalyticsPoint {
  date: string
  value: number
}

export interface AnalyticsTimeSeries {
  exam?: ExamCategory
  metric: string
  range?: string
  points: AnalyticsPoint[]
}

export interface SubjectAccuracyItem {
  subjectId: string
  subjectName: string
  accuracy: number
}

export interface SubjectAccuracyResponse {
  exam?: ExamCategory
  subjects: SubjectAccuracyItem[]
}

export interface WeakTopicItem {
  subjectId: string
  subjectName: string
  topicId: string
  topicName: string
  accuracy: number
  attempts: number
}

export interface WeakTopicsResponse {
  items: WeakTopicItem[]
}

export interface AdminEventSummary {
  id: string
  name: string
  exam: ExamCategory
  type: ExamConfigType
  startAt: string
  registeredCount: number
  status: ExamStatus
}

export interface AdminEventsResponse {
  items: AdminEventSummary[]
}

export interface AdminReferralSummary {
  totalReferrals?: number
  rewardsPaid?: number
  newUsers?: number
  range?: string
}

export type AdminUserRole = 'superadmin' | 'admin' | 'manager' | 'cashier'

export type AdminUserStatus =
  | 'active'
  | 'inactive'
  | 'invited'
  | 'suspended'

export interface AdminUser {
  id: string
  firstName: string
  lastName: string
  username: string
  email: string
  phoneNumber: string
  role: AdminUserRole
  status: AdminUserStatus
  createdAt?: string
  updatedAt?: string
}

export interface AdminUsersMeta {
  page: number
  pageSize: number
  total: number
}

export interface AdminUserList {
  items: AdminUser[]
  meta: AdminUsersMeta
}

export interface AdminUserCreateRequest {
  firstName: string
  lastName: string
  username: string
  email: string
  phoneNumber: string
  role: AdminUserRole
  status: AdminUserStatus
  password: string
}

export type AdminUserUpdateRequest = Partial<
  Omit<AdminUserCreateRequest, 'password'> & { password?: string }
>

export interface AdminInviteRequest {
  email: string
  role: AdminUserRole
  message?: string
}

export interface AdminInviteResponse {
  invited: boolean
  expiresAt?: string
}

export interface AdminBulkStatusRequest {
  userIds: string[]
  status: AdminUserStatus
}

export interface AdminBulkStatusResponse {
  updated: number
}

export interface AdminBulkDeleteRequest {
  userIds: string[]
}

export interface AdminBulkDeleteResponse {
  deleted: number
}
