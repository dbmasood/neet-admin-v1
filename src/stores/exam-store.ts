import { create } from 'zustand'

type ExamSelection = 'NEET_PG' | 'NEET_UG' | 'JEE' | 'UPSC' | 'ALL'

type ExamStore = {
  exam: ExamSelection
  setExam: (exam: ExamSelection) => void
}

export const useExamStore = create<ExamStore>((set) => ({
  exam: 'ALL',
  setExam: (exam) => set(() => ({ exam })),
}))

export function useCurrentExam() {
  const exam = useExamStore((state) => state.exam)
  const setExam = useExamStore((state) => state.setExam)
  return { exam, setExam }
}

export const examLabelMap: Record<ExamSelection, string> = {
  NEET_PG: 'NEET PG',
  NEET_UG: 'NEET UG',
  JEE: 'JEE',
  UPSC: 'UPSC',
  ALL: 'All Exams',
}

export type { ExamSelection }
