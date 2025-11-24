import { examCategoryLabels, type ExamCategory } from '@/types/admin'

export const examCategoryOptions: { label: string; value: ExamCategory }[] =
  (Object.keys(examCategoryLabels) as ExamCategory[]).map((value) => ({
    value,
    label: examCategoryLabels[value],
  }))
