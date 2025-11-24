import { createFileRoute, redirect } from '@tanstack/react-router'
import { SignIn2 } from '@/features/auth/sign-in/sign-in-2'
import { useAuthStore } from '@/stores/auth-store'
import { safeRedirectPath } from '@/lib/utils'

type SignInSearch = {
  redirect?: string
}

export const Route = createFileRoute('/(auth)/sign-in-2')({
  beforeLoad: ({ search }) => {
    const redirectParam = (search as SignInSearch | undefined)?.redirect
    const token = useAuthStore.getState().auth.accessToken
    if (token) {
      const target = safeRedirectPath(redirectParam)
      throw redirect({ to: target })
    }
  },
  component: SignIn2,
})
