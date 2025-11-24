import {
  AudioWaveform,
  BarChart,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock9,
  Command,
  Cpu,
  FileSearch,
  FileText,
  Gift,
  GalleryVerticalEnd,
  LayoutDashboard,
  ListChecks,
  Mic2,
  Trophy,
  Users,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Shadcn Admin',
      logo: Command,
      plan: 'Vite + ShadcnUI',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: 'Admin',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Questions',
          url: '/questions',
          icon: FileText,
        },
        {
          title: 'Subjects',
          url: '/subjects',
          icon: BookOpen,
        },
        {
          title: 'Topics',
          url: '/topics',
          icon: ListChecks,
        },
        {
          title: 'Exams & Events',
          url: '/exams',
          icon: CalendarDays,
        },
        {
          title: 'Podcasts',
          url: '/podcasts',
          icon: Mic2,
        },
        {
          title: 'Users',
          url: '/users',
          icon: Users,
        },
        {
          title: 'Coupons',
          url: '/coupons',
          icon: Gift,
        },
        {
          title: 'Reward Rules',
          url: '/reward-rules',
          icon: Trophy,
        },
        {
          title: 'AI Settings',
          url: '/ai-settings',
          icon: Cpu,
        },
      ],
    },
    {
      title: 'Analytics',
      items: [
        {
          title: 'Analytics',
          icon: BarChart,
          items: [
            {
              title: 'Users',
              url: '/analytics/users',
              icon: CheckCircle2,
            },
            {
              title: 'Learning',
              url: '/analytics/learning',
              icon: FileSearch,
            },
            {
              title: 'Exams',
              url: '/analytics/exams',
              icon: Clock9,
            },
          ],
        },
      ],
    },
  ],
}
