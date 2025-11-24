import { z } from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { SignIn } from '@/features/auth/sign-in'
import { useAuthStore } from '@/stores/auth-store'
import { safeRedirectPath } from '@/lib/utils'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/sign-in')({
  beforeLoad: ({ search }) => {
    const token = useAuthStore.getState().auth.accessToken
    if (token) {
      const target = safeRedirectPath(search.redirect)
      throw redirect({
        to: target,
      })
    }
  },
  component: SignIn,
  validateSearch: searchSchema,
})
