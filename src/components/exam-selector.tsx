import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { type ExamSelection, examLabelMap, useCurrentExam } from '@/stores/exam-store'

const examOptions: Record<ExamSelection, string> = {
  NEET_PG: 'NEET PG',
  NEET_UG: 'NEET UG',
  JEE: 'JEE',
  UPSC: 'UPSC',
  ALL: 'All Exams',
}

type ExamSelectorProps = {
  className?: string
}

export function ExamSelector({ className }: ExamSelectorProps) {
  const { exam, setExam } = useCurrentExam()
  return (
    <div className={cn('rounded-full border border-input/70 bg-transparent px-1 py-0.5 shadow-sm', className)}>
      <Select value={exam} onValueChange={(value) => setExam(value as ExamSelection)}>
        <SelectTrigger className='h-9 min-w-[150px] rounded-full px-3 text-sm'>
          <SelectValue placeholder={examLabelMap.ALL} />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(examOptions).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
