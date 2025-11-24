import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/stores/auth-store'
import { buildPathFromLocation } from '@/lib/utils'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ location }) => {
    const token = useAuthStore.getState().auth.accessToken
    if (!token) {
      const redirectPath = buildPathFromLocation(location)
      throw redirect({
        to: '/sign-in',
        search: { redirect: redirectPath },
      })
    }
  },
  component: AuthenticatedLayout,
})
